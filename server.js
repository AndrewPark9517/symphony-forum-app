// set up ======================================================================
// get all the tools we need
const express  = require('express');
const app      = express();
const port     = process.env.PORT || 8080;
const mongoose = require('mongoose');
const passport = require('passport');
const flash    = require('connect-flash');

const morgan       = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser   = require('body-parser');
const session      = require('express-session');
const methodOverride = require('method-override')

const configDB = require('./config/database.js');

// configuration ===============================================================
//mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(express.static("public")); // static files for ejs files 
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms.
app.use(methodOverride('_method')) // allow PUT/DELETE methods in form element

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'myfavoriteanimalisacat' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

let server;

function runServer(databaseURL) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseURL, err => {
            if(err) {
                reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`)
                resolve();
            })
            .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

function closeServer() {
    mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('closing server');
            server.close(err => {
                if(err) {
                    reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(configDB.url).catch(err => console.error(err));
  }

module.exports = { runServer, closeServer, app };
  