const express = require('express');
const db = require('./configs/db_connection.js');

const PORT = process.env.PORT || 8000;

const app = express();


app.listen(PORT, (err) => {
    if(err){ console.log(err); return; }
    console.log(`server is up and running :: PORT ${PORT}`)
});