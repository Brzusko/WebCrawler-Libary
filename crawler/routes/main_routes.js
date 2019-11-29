const express = require('express');

const mysql = require('mysql');
const config = require('../../config/config.json')
const DB = require('../../db/DB.js');

const router = express.Router();
const pool = mysql.createPool({
    connectionLimit: 10,
    host: config.databases.crawler.host,
    user: config.databases.crawler.user,
    password: config.databases.crawler.password,
    database: config.databases.crawler.database
});

const db = new DB({
    connectionLimit: 10,
    host: config.databases.crawler.host,
    user: config.databases.crawler.user,
    password: config.databases.crawler.password,
    database: config.databases.crawler.database
});


pool.on('error', err => console.log(err));

// LINKS

router.post('/addLink', async (req, res)=>{
    console.log('connection income')
    const body = req.body;
    if(!body || !body.uri)
        res.send({message:'Missing body!'});
    try {
        const result = await db.Query(`INSERT INTO Links (Uri) VALUES ('${body.uri}')`);
        const obj = {
            message: '' + (result.insertId ? `Successfull added link ${body.uri} with new id ${result.insertId}` : `Couldnt add that link: ${body.uri}`)
        }
        res.send(obj);
    } catch(err) {res.send(err);}
});

//router.post('/deleteLink')

router.get('/getAllLinks', async (req,res)=>{

    try
    {
        const result = await db.Query('SELECT * FROM Links');
        res.send(JSON.stringify(result, null, 2));
    } catch(err) {res.send(err);}
})

router.post('/getLink', async (req,res) => {
    if(req.body.id === undefined)
        res.send({message:'Please provide proper body'});
    
        try{
            const result = await db.Query(`SELECT * FROM Links WHERE Links.ID = ${req.body.id}`);
            res.send(result);
        } catch(err) {res.send(err);}
})

router.post('/addNewValue', async (req, res)=>{
    const body = req.body;
    console.log(body.valueType);
    switch(body.valueType) {
        case 'html':
            {
                const queryString = `INSERT INTO ValuesToMain (uriID, htmlType, repleaceContentWith, htmlSelector, migrationTarget, slopeId) 
                VALUES(${body.link_id}, '${body.valueType}','${body.repleaceContent}', '${body.htmlSelector}', '${body.migrationTarget}', ${body.slopeId}); 
                `
                try{
                    const result = await db.Query(queryString);
                    res.send({message:'Successfully added new Value to main!',
                    body
                });
                } catch(err) {res.send(err);}
                break;
            }
        case 'table':
            {
                const queryString = `INSERT INTO ValuesToMain (uriID, htmlType, repleaceContentWith, htmlSelector, migrationTarget, slopeId) 
                VALUES(${body.link_id}, '${body.valueType}','${body.repleaceContent}', '${body.htmlSelector}', '${body.migrationTarget}', ${body.slopeId}); 
                `
                try{
                    const result = await db.Query(queryString);
                    let queries = [];
                    for await(const tableEl of body.tableContent)
                    {
                        const innerQuery = `INSERT INTO ValuesToMain_Table (masterID,htmlSelectorifExists, expectedValue, replaceWith, replacementType, customCSS, customAttributes)
                        VALUES('${result.insertId}', '${tableEl.htmlSelectorifExists}', '${tableEl.expectedValue}', '${tableEl.replaceWith}', '${tableEl.replacementType}', '${tableEl.customCSS}', '${tableEl.customAttributes}');
                        `
                        queries.push(innerQuery);
                        
                    }
                    const tableResult = await db.QueryChain(queries);
                    res.send({message: 'Successfully added new Value to main', body, tableResult});
                } catch(err) {res.send(err);}
                break;
            }
        default:
            {
                res.send({message: 'Unsupported crawler type'});
                break;
            }
    }
});
module.exports = router;