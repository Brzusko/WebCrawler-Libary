const cheerio = require('cheerio');
const path = require('path');
const fsp = require('fs').promises;

/*

*/

class Scraper {
    constructor(DBobject, _toMinePath, _toMinedPath){
        this.db = DBobject;
        this.toMinePath = _toMinePath;
        this.toMinedPath = _toMinedPath;
        this.htmlToScrap = [];
        this.tablesToScrap = [];
        this.pureHtmlContent = [];
    }
    async LoadFiles() {

    }

    async 

    async ScrapTable() {

    }

    async Scrap() {

    }

    async Run() {

    }
}

class PureHtmlContent {
    constructor(ID, htmlContent) {
        this.ID = ID;
        this.htmlContent = htmlContent;
    }
}

module.exports = Scraper;