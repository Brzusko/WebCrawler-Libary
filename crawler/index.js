const express = require('express');
const service = express();
const bodyParser = require('body-parser');
const main_routes = require('./routes/main_routes');

const port = 3333;
const name = 'Crawler'

service.use(bodyParser.json());
service.use('/main', main_routes);

service.get('/', (req,res) =>{
    res.send({name, port, message: 'Is working'});
});

service.listen(port, ()=>{
    console.log(`Child service ${name} is listening on ${port}`);
})