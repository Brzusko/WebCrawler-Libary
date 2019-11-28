const fsp = require('fs').promises;
const path = require('path');
const mysql = require('mysql');
const puppeteer = require('puppeteer');
const EventEmitter = require('events').EventEmitter;
const DB = require('../db/DB.js')
const config = require('../config/config.json');
const cheerio = require('cheerio');

class Crawler extends EventEmitter{
    constructor(_path){
        super();
        this.browswer = null;
        this.page = null;
        this.rawPath = path.resolve(_path, 'temp/raw');
        this.modified = path.resolve(_path, 'temp/modified');
        this.mined = path.resolve(_path, 'temp/mined');
        this.state = 'waiting';
        this.interval = null;
        this.path = _path;
        this.db = null;
        this.addListener('OnGeneratedRaw', async()=>{
            this.state = 'waiting';
        });
    }
    async Run(){
        if(this.state == 'running')
            return;
        //Create html files with scraped content
        //Manipulate that files then create new html file with edited content
        //And sooooo on
        this.state = 'running';
        await this.PurgeTempFiles();
        await this.GetHtmlFromLinks();
        await this.LoadContentToModify();
    }
    async Launch(interval){
        this.db = new DB({
            connectionLimit: 10,
            host: config.databases.crawler.host,
            user: config.databases.crawler.user,
            password: config.databases.crawler.password,
            database: config.databases.crawler.database
        });
        this.browswer = await puppeteer.launch({
            ignoreDefaultArgs: ['--disable-extensions'],
        });
        this.page = await this.browswer.newPage();
        this.interval = setInterval(async ()=>{
            await this.Run();
        }, interval);
        
    }

    async GetHtmlFromLinks() {
        console.log('Generating links start');
        const result = await this.db.Query('SELECT * FROM Links');
        for await(const site of result){
            await this.page.goto(site.Uri);
            const content = await this.page.content();
            const filePath = path.resolve(this.rawPath, `${site.ID}.html`);
            try {
                const fileResult = await fsp.appendFile(filePath, content);
            } finally{}
        }
    }
    async PurgeTempFiles() {
        console.log('Staring purging ');
        const tempPath = path.resolve(this.path, 'temp');
        const dir = await fsp.opendir(path.resolve(this.path, 'temp'));
        for await(const dirent of dir){
            if(dirent.isDirectory())
            {
                const innerDirent = path.resolve(tempPath, dirent.name)
                const filesInDirent = await fsp.readdir(innerDirent, {withFileTypes:true});
                for await(const file of filesInDirent) {
                    if(file.name != '.a')
                        await fsp.unlink(path.resolve(innerDirent, file.name));
                }
            } else {
                if(dirent.name != '.a')
                    await fsp.unlink(path.resolve(tempPath, dirent.name));
            }
        }
        console.log('ending purging');
        this.emit('OnPurged');
    }

    async LoadContentToModify() {
        const dir = await fsp.opendir(this.rawPath);
        for await(const dirent of dir) {
            if(dirent.name !== '.a'){
                const id = dirent.name.match(/^[a-z0-9]+/g);
                const convertedId = Number(JSON.parse(JSON.stringify(id)));
                const htmlFile = await fsp.readFile(path.resolve(this.rawPath, dirent.name))
                const $ = cheerio.load(htmlFile);
                const result = await this.db.Query(`SELECT htmlSelector, ID FROM ValuesToMain WHERE uriID = ${convertedId}`);
                const scrapedHtml = $(result[0].htmlSelector).parent().html();
                try{
                    const fileAppendResult = await fsp.appendFile(path.resolve(this.mined, `${result[0].ID}.html`), scrapedHtml);
                } catch(err) {
                    console.log(err);
                } finally{
                    this.emit('OnGeneratedRaw');
                }
            }
        }
    }
}

module.exports = Crawler;