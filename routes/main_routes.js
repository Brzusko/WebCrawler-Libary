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
    let options = {
        method: 'POST',
        uri: 'http://localhost:3333/main/addNewValue',
        body: {},
        json: true
    }

});


module.exports = router;