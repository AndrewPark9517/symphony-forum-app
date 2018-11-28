// load all the things we need
const LocalStrategy = require('passport-local').Strategy;

// load up the user model
const { User } = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // using named strategy since we have two local strategies: one for login and one for signup

    passport.use('local-signup', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {
        // asynchronous
        // User.findOne wont fire unless data is sent back
        
        process.nextTick(function() {

        // error messages for user to see when signing up
        // checks for whitespace, missing fields, and long enough password
        if(username.trim() !== username || password.trim() !== password) {
            console.log('trim didnt work');
            return done(null, false, req.flash('signupMessage', 'Cannot start or end with whitespace'));
        }

        if(!username || !password) {
            console.log('username||password didnt work');
            return done(null, false, req.flash('signupMessage', 'Missing required field'));
        }

        if(password.length < 8 ) {
            console.log('password length test fail');
            return done(null, false, req.flash('signupMessage', 'Password is too short '));
        }
        
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.username' :  username }, function(err, user) {

                // if there are any errors, return the error
                if (err) {
                    console.log('Error occured');
                    return done(err);
                }

                // check to see if there's already a user with that email
                if (user) { 
                    console.log('username already taken error');
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else { 

                    // if there is no user with that email
                    // create the user
                    const newUser = new User();

                    // set the user's local credentials
                    newUser.local.username = username;
                    newUser.local.password = newUser.generateHash(password);

                    // save the user
                    newUser.save(function(err) {
                        if (err) {
                            console.log('Error while saving')
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }
            });    
        });
    }));

    passport.use('local-login', new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) { 

        // checking to see if given credentials exist
        User.findOne({ 'local.username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err) 
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); 

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Wrong password.')); 

            // all is well, return successful user
            return done(null, user);
        });

    }));

};