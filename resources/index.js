const express = require('express');
const ResLoader = require('../file_dealing/ResourceSearcher');

const service = express();
const port = 3335;
const name = 'Resources'

const mainPath = process.argv.slice(2);
const rl = new ResLoader(mainPath[0]);

service.get('/images', async (req,res) =>{
    const data = await rl.GetImagesDataFromFile();
    res.send(data);
});

service.get('/reload', async (req, res)=>{
    let returnObj = {
        message: null
    }
    try{
        await rl.LoadResources();
        returnObj.message = 'Images reload has been succed!'
    } catch(err) {
        returnObj.message = err;
    }
    res.send(returnObj);
});

service.listen(port, ()=>{
    console.log(`Child service ${name} is listening on ${port}`);
    rl.LoadResources();
})