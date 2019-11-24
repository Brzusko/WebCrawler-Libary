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

service.listen(port, ()=>{
    console.log(`Child service ${name} is listening on ${port}`);
    
    rl.LoadResources();
})