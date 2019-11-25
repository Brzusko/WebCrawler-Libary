const express = require('express');
const path = require('path');
const request = require('request-promise-native');
const mysql = require('mysql');
const config = require('./config/config.json');
const ServiceSearcher = require('./file_dealing/ServiceSearcher');
const SerivceRunner = require('./service/ServiceScheduler');
const mainPath = path.resolve(__dirname);


const mainHttpServer = express();



// Testing routes


mainHttpServer.get('/', async (req, res) =>{
    const result = await request('http://localhost:3335/images');
    res.send(JSON.parse(result));
});

mainHttpServer.listen(config.httpServer.mainPort, ()=>{
    console.log('Main service has beed started on port ' + config.httpServer.mainPort);
    const serviceSearcher = new ServiceSearcher(mainPath);
    const runner = new SerivceRunner(serviceSearcher);
    runner.RunServices();
});
