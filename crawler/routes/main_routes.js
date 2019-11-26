const express = require('express');

const mysql = require('mysql');
const config = require('../../config/config.json')

const router = express.Router();
const pool = mysql.createPool({
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

    pool.getConnection((err, connection) =>{
        if(err) res.send({message:err});
        const queryString = `INSERT INTO Links (Uri) VALUES ('${body.uri}')`;
        const obj = {
            message:undefined
        }
        connection.query(queryString, (error, results, fields)=>{
            if(error) obj.message = error;
            obj.message = `Successfully added new Link to database ${body.uri}`;
            connection.release();
        });
        if(obj.message === undefined)
            obj.message = 'That link already exists in database';
        res.send(obj);
    });
});

//router.post('/deleteLink')

router.get('/getAllLinks', async (req,res)=>{
    pool.getConnection((err, connection)=>{
        if(err) res.send(err);
        const queryString = 'SELECT * FROM Links';
        const obj = {
            message: undefined
        }
        connection.query(queryString, (error, results, field)=>{
            if(error) obj.message = error;
            obj.message = new Array();
            results.forEach(element => {
                obj.message.push(element);
            });
            connection.release();   
            res.send(obj);        
        });
    })
})

router.post('/getLink', async (req,res) => {
    if(req.body.id === undefined)
        res.send({message:'Please provide proper body'});
    pool.getConnection((err, connection) =>{
        if(err) res.send({message:err});
        const queryString = `SELECT * FROM Links WHERE Links.ID = '${req.body.id}'`
        connection.query(queryString, (error, results, field) =>{
            obj = {
                message: undefined
            }
            if(error) obj.message = error;
            obj.message = results;
            connection.release();
            res.send(obj);
        })
    })
})

router.post('/addNewValue', async (req, res)=>{
    const body = req.body;
    console.log(body.valueType);
    switch(body.valueType) {
        case 'html':
            {
                pool.getConnection((err, connection)=>{
                    if(err) res.send({message: err});
                    const queryString = `INSERT INTO ValuesToMain (uriID, htmlType, repleaceContentWith, htmlSelector, migrationTarget, slopeId) 
                    VALUES(${body.link_id}, '${body.valueType}','${body.repleaceContent}', '${body.htmlSelector}', '${body.migrationTarget}', ${body.slopeId}); 
                    `
                    connection.query(queryString, (error, result, fields) =>{
                        if(error) res.send(error);
                        res.send({message:`Successfully added new value to mine wih itd ${result.insertId}`});
                        connection.release();
                    })
                });
                break;
            }
        case 'table':
            {
                pool.getConnection((err,connection) =>{
                    if(err){
                        res.send(err);
                        return;
                    }
                    const queryString = `INSERT INTO ValuesToMain (uriID, htmlType, repleaceContentWith, htmlSelector, migrationTarget, slopeId) 
                    VALUES(${body.link_id}, '${body.valueType}','${body.repleaceContent}', '${body.htmlSelector}', '${body.migrationTarget}', ${body.slopeId}); 
                    `
                    connection.query(queryString, (error, result, fields) =>{
                        if(error) res.send(error);
                        const masterId = result.insertId;
                        const thArray = body.th_selectors;
                        console.log(thArray);
                        while(thArray.length > 0) {
                            const th = thArray.pop();
                            const innerQueryString = `INSERT INTO ValuesToMain_Table (masterValueID, th_selector)
                            VALUES ('${masterId}', '${th.htmlSelector}')`;
                            connection.query(innerQueryString, (innerError, innerResult, innerField)=>{
                                if(innerError){
                                    console.log(innerError);          
                                }
                                const innerMasterId = innerResult.insertId;
                                const tds = th.tds;
                                
                                while(tds.length > 0) {
                                    const td = tds.pop();
                                    const tdQueryString = `INSERT INTO ValuesToMain_Table_Content (th_ID, statement, replaceWith, replaceMode)
                                    VALUES('${innerMasterId}', '${td.statement}', '${td.replaceWith}', '${td.replaceMode}')`
                                    connection.query(tdQueryString, (tdError, tdResult, tdField)=>{
                                       if(tdError) console.log(tdError); 
                                    });
                                }
                            });
                        }
                        connection.release();
                        res.send('Added new vals');
                    })
                });
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