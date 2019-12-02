const cheerio = require('cheerio');
const path = require('path');
const fsp = require('fs').promises;

/*

*/

class Scraper {
    constructor(DBobject, _toModifiedPath, _toMinedPath){
        this.db = DBobject;
        this.toModifiedPath = _toModifiedPath;
        this.toMinedPath = _toMinedPath;
        this.links = [];
        this.table = [];
        this.values = [];
    }

    async ScrapTable() {

    }

    async Scrap() {

    }

    async Run() {
        await this.GetInfoFromDB();
        this.ToString();
    }

    async GetInfoFromDB() {
        this.links = await this.db.Query(`SELECT * FROM Links;`);
        if(this.links.length === 0)
            return;
        for await(const link of this.links)
        {
            const value = await this.db.Query(`SELECT * FROM ValuesToMain WHERE uriID = ${link.ID}`);
            if(value.length === 0)
                continue;
            this.values.push(value);

            if(value.htmlType === 'table')
            {
                const tables = await this.db.Query(`SELECT * FROM ValuesToMain_Table WHERE masterID = ${value.ID}`);
                if(table.length === 0)
                    continue;
                this.table.push(tables);
            }
                

        }

    }
    ToString(){
        console.log(this.links);
        console.log(this.values);
        console.log(this.table);
    }
}


module.exports = Scraper;