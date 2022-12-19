const express = require('express');
const path = require('path');
const mysql = require('mysql');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');


dotenv.config({path: './.env'})  // hide senstive info from code

const app = express();

// creates a connection to xammp database
const database = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

//show where other files eg css are in file __dirname - takes to working dir
const publicDirectory = path.join(__dirname, './public' );
app.use(express.static(publicDirectory)); // ensure public file is used


// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: false }));

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cookieParser());

app.set('view engine', 'hbs');

//connects to database
database.connect( (error) => {
    if(error){
       console.log(error); 
    } else{
        console.log("MYSQL Connected...")
    }
});


//Define Routes by grabbing routes
app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));

//listen for connection on port 5000
app.listen(5000, () =>{
    console.log("server started on port 5000")
});