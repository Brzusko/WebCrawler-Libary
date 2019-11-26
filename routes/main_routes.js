const express = require('express');
const request = require('request-promise-native');
const mysql = require('mysql');

const router = express.Router();

// Links
router.post('/addLink', async (req,res)=>{
    let options = {
        method: 'POST',
        uri: 'http://localhost:3333/main/addLink',
        body: req.body,
        json: true
    }
    const result = await request(options);
    res.send(result);
});

router.get('/getAllLinks', async (req,res) =>{
    let options = {
        method: 'GET',
        uri : 'http://localhost:3333/main/getAllLinks'
    }
    const result = await request(options);
    res.send(result);
})

// Values

router.post('/addNewValue', async (req,res) =>{
    let valueType = 'html';
    let options = {
        method: 'POST',
        uri: 'http://localhost:3333/main/addNewValue',
        body: {},
        json: true
    }
    let op2 = {
        method: options.method,
        json: options.json
    };
    op2.uri = 'http://localhost:3333/main/getLink'
    op2.body = {id: req.body.link_id};
    const link = await request(op2);
    if(link.message.length === 0)
        res.send({message: 'Didnt find link with that id'});
    if(!req.body.htmlType || !req.body.htmlSelector || !req.body.migrationTarget || !req.body.slopeId)
        res.send({message:'Wrong body content'});
    if(req.body.th_selectors && req.body.htmlSelector === 'table')
    {
        for(let i = 0; i < req.body.th_selectors.length; i++){
            if(!req.body.th_selectors[i].tds || !req.body.th_selectors[i].htmlSelector)
            {
                res.send({message: 'Wrong th data provided'});
                return;
            }

            for(let j = 0; j < req.body.th_selectors[i].tds.length; j++){
                if(!req.body.th_selectors[i].tds[j].statement || !req.body.th_selectors[i].tds[j].replaceWith || !req.body.th_selectors[i].tds[j].replaceMode){
                    res.send({message:' Wrong td data privded'});
                    return;
                }
            };
        }
        valueType = 'table';
    }
    options.body = req.body;
    options.body.valueType = valueType;
    const result = await request(options);
    res.send(result);
});


module.exports = router;