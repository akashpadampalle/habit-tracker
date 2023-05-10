// including mongoose library
const mongoose = require('mongoose');

// using dotenv to access mongodb url (envirement variable)
// require('dotenv').config();

const uri = process.env.HT_DB_URI;

// connecting to databaseR
// mongoose.connect(process.env.HT_DB_URI);
mongoose.connect(uri);

// getting connection to constant
const db = mongoose.connection;

// if error accures
db.on('error', console.error.bind(console, 'error connecting to db'));

// if successfully connected to db
db.once('open', () => console.log('database is connected successfully :: MongoDB'));

//exporting db connection
module.exports = db;
