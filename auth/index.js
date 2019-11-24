const express = require('express');
const service = express();

const port = 3332;
const name = 'Auth'

service.get('/', (req,res) =>{
    res.send({name, port, message: 'Is working'});
});

service.listen(port, ()=>{
    console.log(`Child service ${name} is listening on ${port}`);
})