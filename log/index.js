const express = require('express');
const service = express();

const port = 3331;
const name = 'Log'

service.get('/', (req,res) =>{
    res.send({name, port, message: 'Is working'});
});

service.listen(port, ()=>{
    console.log(`Child service ${name} is listening on ${port}`);
})