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
        
        for await(const tableObj of this.table){
            const dirMinedPath = path.resolve(this.toMinedPath, `${tableObj.linkID}`);
            const htmlTableFilePath = path.resolve(dirMinedPath, `${tableObj.ID}.html`);
            const dirModifiedPath = path.resolve(this.toModifiedPath, `${tableObj.linkID}`);
            const htmlTableModifiedPath = path.resolve(dirModifiedPath, `${tableObj.ID}.html`);
            
            
            try{
                const readResult = (await fsp.readFile(htmlTableFilePath)).toString();
                let $ = cheerio.load(readResult);
                $('td').each(function(index, element){
                    const tdContent = $(this).html();
                    for (const tableScrapInfo of tableObj.tables)
                    {
                        const index = tdContent.indexOf(tableScrapInfo.expectedValue)
                        if(index !== -1)
                            $(this).replaceWith(tableScrapInfo.replaceWith);
                    }
                });
                
                const creatingDirResult = await fsp.mkdir(dirModifiedPath);
                const writeFileResult = await fsp.appendFile(htmlTableModifiedPath, $.html());
                
            } catch(err) {console.log(err);}
        }
    }

    ReplaceTableContent($, tableObj){
        return new Promise((resolve, reject) =>{

        });
    }

    async Scrap() {
        for await(const array of this.values)
        {
            let innerLoopStarted = false;
            for await(const valueInArray of array)
            {
                if(innerLoopStarted === false && valueInArray.htmlType === 'html')
                {
                    try{
                        const dirCreationResult = await fsp.mkdir(path.resolve(this.toModifiedPath, `${valueInArray.uriID}`));
                        innerLoopStarted = true;
                    } catch(err) {console.log(err);}
                }

                const minedPathDir = path.resolve(this.toMinedPath, `${valueInArray.uriID}`);
                const minedHtmlFilePath = path.resolve(minedPathDir, `${valueInArray.ID}.html`);
                const modifiedPathDir = path.resolve(this.toModifiedPath, `${valueInArray.uriID}`);
                const modifiedHtmlFilePath = path.resolve(modifiedPathDir, `${valueInArray.ID}.html`);

                if(valueInArray.replaceVariable === null && valueInArray.htmlType === 'html')
                    try{
                        console.log(modifiedHtmlFilePath);
                        const readResult = await fsp.readFile(minedHtmlFilePath);
                        const writeResult = await fsp.appendFile(modifiedHtmlFilePath, readResult);
                    } catch(err) {console.log(err);}
                else if(valueInArray.replaceVariable !== null && valueInArray.htmlType === 'html')
                {
                    try{
                        const readResult = await fsp.readFile(minedHtmlFilePath);
                        const newReplace = valueInArray.replaceContentWith.replace('$', valueInArray.replaceVariable);
                        const writeResult = await fsp.appendFile(modifiedHtmlFilePath, newReplace);
                    } catch(err) {console.log(err);}
                }
            }
        }
    }

    async Run() {
        await this.GetInfoFromDB();
        //await this.Scrap();
        await this.ScrapTable();
        await this.Dispose();
    }

    async GetInfoFromDB() {
        this.links = await this.db.Query(`SELECT * FROM Links;`);
        if(this.links.length === 0)
            return;
        for await(const link of this.links)
        {
            const values = await this.db.Query(`SELECT * FROM ValuesToMain WHERE uriID = ${link.ID}`);
            if(values.length === 0)
                continue;
            this.values.push(values);

            for await(const value of values){
                if(value.htmlType !== 'table')
                    continue;
                const tables = await this.db.Query(`SELECT * FROM ValuesToMain_Table WHERE masterID = ${value.ID}`);
                if(tables.length === 0)
                    continue;
                this.table.push({linkID: link.ID, ID: value.ID, tables});
            }
                

        }

    }
    async Dispose(){
        this.links = new Array();
        this.values = new Array();
        this.table = new Array();
    }
    ToString(){
        console.log(this.links);
        console.log(this.values);
        console.log(this.table);
    }
}


module.exports = Scraper;