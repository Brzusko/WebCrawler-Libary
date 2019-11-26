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

router.post('/addNewValue' async (req, res)=>{

});
module.exports = router;