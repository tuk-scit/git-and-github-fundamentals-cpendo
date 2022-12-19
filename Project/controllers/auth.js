const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { promisify } = require('util');

const database = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.login = async (req, res) => {
  try {
    const { regno, password } = req.body;

    if( !regno || !password ) {
      return res.status(400).render('index', {
        message: 'Please provide an email and password'
      })
    }

    database.query('SELECT * FROM Students WHERE regno = ?', [regno], async (error, results) => {
      console.log(results)
      if( !results || !(await bcrypt.compare(password, results[0].password)) ) {
        res.status(401).render('index', {
          message: 'Email or Password is incorrect'
        })
      } else {
        const id = results[0].regno;

        const token = jwt.sign({ id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN
        });

        console.log("The token is: " + token);

        const cookieOptions = {
          expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
          ),
          httpOnly: true
        }

        res.cookie('jwt', token, cookieOptions );
        res.status(200).redirect("rules");
      }

    })

  } catch (error) {
    console.log(error);
  }
}

exports.register = (req, res) => {
   console.log(req.body);

    const {name, regno, password, school, department} = req.body;

    database.query('SELECT regno FROM Students WHERE regno = ?', [regno], async(error, results) =>{ 
        if(error){
            console.log(error);
        }

        if (results.length > 0){
            return res.render('register', {
                message: "That Registration number is already in use"
            });
        }

        // add password hashing using bcrypt
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);
    
        database.query('INSERT INTO Students SET ?', {name: name , regno:regno, password:hashedPassword, school:school, 
            department:department}, (error, results) =>{
                if(error){
                    console.log(error);
                } else {
                    console.log(results);
                    return res.render('register', {
                        message: "Student registered"
                    });
                }
        
            })

    });
}

exports.isLoggedIn = async (req, res, next) => {
  // console.log(req.cookies);
  if( req.cookies.jwt) {
    try {
      //1) verify the token
      const decoded = await promisify(jwt.verify)(req.cookies.jwt,
      process.env.JWT_SECRET
      );

      console.log(decoded);

      //2) Check if the user still exists
      database.query('SELECT * FROM Students WHERE regno = ?', [decoded.id], (error, result) => {
        console.log(result);

        if(!result) {
          return next();
        }

        req.user = result[0];
        console.log("user is")
        console.log(req.user);
        return next();

      });
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
}

