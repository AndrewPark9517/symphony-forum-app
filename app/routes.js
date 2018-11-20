// import Thread model which we'll need to pass into the ejs when rendering
const { Thread } = require('./models/thread');

// app/routes.js
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    app.get('/thread/:title', isLoggedIn, function(req,res) {
        Thread.findOne({title: req.params.title})
        .then(function(thread) {
            res.render('thread.ejs', { 
                thread: thread, 
                user: req.user});
        });
    });

    app.post('/thread/:title/post', isLoggedIn, function(req,res) {
        Thread.findOne({title: req.params.title})
        .then(function(thread) {
            console.log("thread to post to:", req.params.title);
            thread.post.push({
                content: req.body.post,
                user: req.body.user_id,
                created: Date.now(),
                comment: []
            });
            thread.save();
        })
        .then(function() {
            res.redirect(`/thread/${req.params.title}`);
        });
    });

    app.post('/thread/:title/comment', isLoggedIn, function(req,res) {
        console.log("comment body:", req.body);
        console.log("post index", req.body.post_index);
        
        Thread.findOne({title: req.params.title})
        .then(function(thread) {
            thread.post[req.body.post_index].comment.push({
                content: req.body.comment,
                user: req.body.user_id,
                created: Date.now()
            })
            thread.save();
        })
        .then(function() {
            res.redirect(`/thread/${req.params.title}`);
        });
    });
    

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}
