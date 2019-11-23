const express = require('express');
const config = require('./config/config.json');
const ServiceSearcher = require('./file_dealing/ServiceSearcher');

const t = new ServiceSearcher();
t.FindDirectories();

const mainHttpServer = express();

// Testing routes

mainHttpServer.get('/', (req, res) =>{
    res.send({workin:"Server is working!"});
});

mainHttpServer.listen(config.httpServer.mainPort, ()=>{
    console.log('Main service has beed started on port ' + config.httpServer.mainPort);
});
