const express = require('express');
const expressLayouts = require('express-ejs-layouts') 
const db = require('./configs/db_connection.js');

const PORT = process.env.PORT || 8000;

const app = express();

// setting up encoding parsers
app.use(express.json());
app.use(express.urlencoded());

//setting up static (public) folder to use
app.use(express.static('./public'));

// setting up ejs
app.use(expressLayouts) // setting up layout to use
app.set('view engine', 'ejs');
app.set('views', './views');
app.set('layout extractStyles', true);// this will extract style from body of ejs and put it into head
app.set('layout extractScripts', true); // this will extract style from body of ejs and out it at last of body


// setting route file
app.use('/', require('./routes/index'));

app.listen(PORT, (err) => {
    if(err){ console.log(err); return; }
    console.log(`server is up and running :: PORT ${PORT}`)
});