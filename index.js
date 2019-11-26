const express = require('express');
const path = require('path');
const request = require('request-promise-native');
const mysql = require('mysql');
const body_parser = require('body-parser');
const config = require('./config/config.json');
const ServiceSearcher = require('./file_dealing/ServiceSearcher');
const SerivceRunner = require('./service/ServiceScheduler');
const main_routes = require('./routes/main_routes');
const mainPath = path.resolve(__dirname);


const mainHttpServer = express();



// Testing routes

mainHttpServer.use(body_parser.json());
mainHttpServer.use('/main', main_routes);

mainHttpServer.get('/', async (req, res) =>{
    const filePath = path.resolve(__dirname, 'crawler/temp/mined/14.html');
    res.sendFile(filePath);
});

mainHttpServer.listen(config.httpServer.mainPort, ()=>{
    console.log('Main service has beed started on port ' + config.httpServer.mainPort);
    const serviceSearcher = new ServiceSearcher(mainPath);
    const runner = new SerivceRunner(serviceSearcher);
    runner.RunServices();
});
