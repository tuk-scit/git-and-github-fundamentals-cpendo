const express = require('express');
const authController = require('../controllers/auth');
const mysql = require('mysql');


const database = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE
});

const router = express.Router();

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/register', (req, res) => {
    res.render('register');
});

router.get('/rules', authController.isLoggedIn, (req, res) => {
    console.log(req.user);
    if( req.user ) {
      res.render('rules', {
        user: req.user
      });
    } else {
      res.redirect('/');
    }
});

router.get('/vote', (req, res) =>{

  database.query('SELECT * FROM Candidate', function (err, rows) {
    if (err) {
      console.log(err)
    }
      res.render('vote', { data: rows})
      console.log(rows)
  });
  
});


module.exports = router;