const fsp = require('fs').promises;
const path = require('path');
const mysql = require('mysql');
const puppeteer = require('puppeteer');
const EventEmitter = require('events').EventEmitter;
const DB = require('../db/DB.js')
const config = require('../config/config.json');
const Scraper = require('./Scraper.js');
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
        this.scraper = null;
        this.addListener('OnGeneratedRaw', async()=>{
            
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
        await this.scraper.Run();
        await this.AddDelay(2000);
        //scrap things
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
        this.scraper = new Scraper(this.db, this.mined, this.modified);
        this.interval = setInterval(async ()=>{
            await this.Run();
        }, interval);
        
    }

    async GetHtmlFromLinks() {
        console.log('Execution 2 started');
        const result = await this.db.Query('SELECT * FROM Links');
        for await(const site of result){
            await this.page.goto(site.Uri);
            const content = await this.page.content();
            const filePath = path.resolve(this.rawPath, `${site.ID}.html`);
            try {
                const fileResult = await fsp.appendFile(filePath, content);
            } finally{}
        }
        console.log('Execution 2 ended');
    }
    async PurgeTempFiles() {
        console.log('Execution 1 started');
        const tempPath = path.resolve(this.path, 'temp');
        const mainDir = await fsp.opendir(tempPath);
        
        const filesToDelete = [];
        const dirsToDelete = [];

        for await(const dirent of mainDir){
            
            let inDirentPath = path.resolve(tempPath, dirent.name);

            if(dirent.isDirectory()) {
                const innerDir = await fsp.opendir(inDirentPath);
                for await(const innerDirent of innerDir)
                    {
                        if(this.IsIgnoredFile(innerDirent.name, ['.a']) === true)
                            continue;
                        const inInnerDirentPath = path.resolve(inDirentPath, innerDirent.name);
                        if(innerDirent.isDirectory())
                        {
                            dirsToDelete.push(inInnerDirentPath);

                            const lastDir = await fsp.opendir(inInnerDirentPath);
                            for await(const file of lastDir)
                                filesToDelete.push(path.resolve(inInnerDirentPath, file.name)); 
                        }
                        else
                            filesToDelete.push(inInnerDirentPath);
                    }
            }
            else
                filesToDelete.push(inDirentPath);

        }

        for await(const file of filesToDelete)
            try{
                const delResult = await fsp.unlink(file);
            } catch(err) {console.log(err);}
        
        for await(const dir of dirsToDelete)
            try{
                const delResult = await fsp.rmdir(dir);
            } catch(err) {console.log(err);}

        console.log('Execution 1 ended');
        this.emit('OnPurged');
    }


    IsIgnoredFile(fileToCheck, ignoredFiles){
        let IsIgnored = false;
        for(let i = 0; i < ignoredFiles.length; i++){
            if(fileToCheck == ignoredFiles[i]){
                IsIgnored = true;
                break;
            }
        }
        return IsIgnored;
    }

    async LoadContentToModify() {
        console.log('Execution 3 started');
        const dir = await fsp.opendir(this.rawPath);
        for await(const dirent of dir) {
            if(dirent.name !== '.a'){
                const id = dirent.name.match(/^[a-z0-9]+/g);
                const convertedId = Number(JSON.parse(JSON.stringify(id)));
                const result = await this.db.Query(`SELECT htmlSelector, ID, htmlType FROM ValuesToMain WHERE uriID = ${convertedId}`);
                if(result.length === 0 ) continue;
                const htmlFile = await fsp.readFile(path.resolve(this.rawPath, dirent.name))
                const $ = cheerio.load(htmlFile);
                const scrapedHtml = $(result[0].htmlSelector).parent().html();
                try {
                    const directoryAppendResult = await fsp.mkdir(path.resolve(this.mined, `${convertedId}`));
                    const fileAppendResult = await fsp.appendFile(path.resolve(this.mined, `${convertedId}/${result[0].ID}.html`), scrapedHtml);
                } catch(err) {
                    console.log(err);
                } finally{
                    this.emit('OnGeneratedRaw');
                }
            }
        }
        console.log('Execution 3 ended');
    }
    AddDelay(ms){
        return new Promise((resolve, reject)=>{
            const timeout = setTimeout(()=>{
                this.state = 'waiting';
                resolve();
            }, ms);
        })
    }
}

module.exports = Crawler;