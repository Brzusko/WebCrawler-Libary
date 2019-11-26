const fsp = require('fs').promises;
const path = require('path');
const mysql = require('mysql');
const puppeteer = require('puppeteer');
const EventEmitter = require('events').EventEmitter;
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
        this.pool = null;
        this.state = 'waiting';
        this.interval = null;
        this.path = _path;
        // this.addListener('OnPurged', async ()=>{
        //     await this.GetHtmlFromLinks();
        // });
        this.addListener('OnGeneratedRaw', async()=>{
            await this.LoadContentToModify();
            this.state = 'waiting';
        });
        // this.addListener('OnGeneratedMined', async()=>{
        //     await this.PurgeTempFiles();
        // })
        // this.addListener('OnLaunch', async()=>{
        //     await this.PurgeTempFiles();
        // })
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
    }
    async Launch(interval){
        this.pool = mysql.createPool({
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
        this.pool.getConnection(async (err, connection)=>{
            if(err) throw err;
            connection.query('SELECT * FROM Links', async (error, result, fields)=>{
                for(let i = 0; i<result.length; i++){
                    console.log(result[i].Uri);
                    await this.page.goto(result[i].Uri);
                    const content = await this.page.content();
                    const filePath = path.resolve(this.rawPath,`${result[i].ID}.html`);
                    try {
                    const fileResult = await fsp.appendFile(filePath, content);
                    } finally{}
                }
                connection.release();
                console.log('Generating ended');
                this.emit('OnGeneratedRaw');
            });
        });
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

                this.pool.getConnection(async (err, connection) =>{
                    console.log('pooling');
                    connection.query(`SELECT htmlSelector, ID FROM ValuesToMain WHERE uriID = ${convertedId}`, async (error,results,fileds)=>{
                        if(error) throw error;
                        const scrapedHtml = $(results[0].htmlSelector).parent().html()
                        const fileAppendResult = await fsp.appendFile(path.resolve(this.mined, `${results[0].ID}.html`), scrapedHtml);
                        connection.release();
                        console.log('Ending load')
                        this.emit('OnGeneratedMined');
                    });
                });
            }
        }
    }
}

module.exports = Crawler;