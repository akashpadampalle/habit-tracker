const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const db = require('./configs/db_connection.js');

// using passport local for authentication
const passport = require('passport');
const localStrategy = require('./configs/passport_local_strategy.js');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');


const PORT = process.env.HT_PORT;

const app = express();

// setting up encoding parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// setting up session 
app.use(session({
    name: 'habit tracker',
    secret: proocess.env.HT_SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: (1000 * 60 * 60 * 24) // saving cookie for maximum one days
    },
    store: MongoStore.create({
        mongoUrl: process.env.HT_DB_URI,
        collectionName: 'sessions',
        autoRemove: 'native'
    })
}));

app.use(passport.initialize());
app.use(passport.session());


// we have created costom middleware to set user dedails to res.locals
app.use(passport.setAuthenticatedUser);

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
    if (err) { console.log(err); return; }
    console.log(`server is up and running :: PORT ${PORT}`)
});