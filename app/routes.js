// import Thread model which we'll need to pass into the ejs when rendering
const { Thread } = require('./models/thread');
const { User } = require('./models/user');

// app/routes.js
module.exports = function(app, passport) {

    // load home page
    app.get('/', function(req, res) {
        res.render('index.ejs'); 
    });

    // show the login form
    app.get('/login', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/thread/General', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
    
    // show the signup form
    app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/thread/General', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // get profile for user if he/she is logged in
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // get profile edit page for user if he/she is logged in
    app.get('/profileEdit', isLoggedIn, function(req, res) {
        res.render('profileEdit.ejs', {
            user: req.user
        });
    });

    // process edit request for profile is he/she is logged in
    app.post('/profileEdit', isLoggedIn, function(req,res) {
        User.findByIdAndUpdate(req.user._id, { $set: 
            {"local.firstName": req.body.firstName,
             "local.lastName": req.body.lastName,
             "local.instrument": req.body.instrument}}, {new: true})
        .then(function() {
            res.redirect('/profile');
        });
    });

    // get thread based on title chosen by user
    app.get('/thread/:title', isLoggedIn, function(req,res) {
        Thread.findOne({title: req.params.title})
        .then(function(thread) {
            res.render('thread.ejs', { 
                thread: thread, 
                user: req.user});
        });
    });

    // add post given by user to database and rerender page to show
    app.post('/thread/:title/post', isLoggedIn, function(req,res) {
        Thread.findOne({title: req.params.title})
        .then(function(thread) {
            console.log("thread to post to:", req.params.title);
            thread.post.push({
                content: req.body.post,
                user: req.user._id,
                created: Date.now(),
                comment: []
            });
            thread.save();
        })
        .then(function() {
            res.redirect(`/thread/${req.params.title}`);
        });
    });

    // add comment to database and rerender page to show
    app.post('/thread/:title/comment', isLoggedIn, function(req, res) {
        Thread.findOne({title: req.params.title})
        .then(function(thread) {
            const postIndex = thread.post.findIndex(function(post) {
                // using double equals since post._id is a string and req.body.post_id is an object
                return post._id == req.body.post_id;
            });
            thread.post[postIndex].comment.push({
                content: req.body.comment,
                user: req.user._id,
                created: Date.now()
            });
            thread.save();
        })
        .then(function() {
            res.redirect(`/thread/${req.params.title}`);
        });
    });

    // uses method override so form element can make a put request
    app.put('/thread/:title/comment', isLoggedIn, function(req, res) {
        Thread.findOne({title: req.params.title})
        .then(function(thread) {
            // find index of the post the comment to be updated belongs to
            const postIndex = thread.post.findIndex(function(post) {
                // using double equals since post._id is a string and req.body.post_id is an object
                return post._id == req.body.post_id;
            });
            // find index of the comment to be updated within its post
            const commentIndex = thread.post[postIndex].comment.findIndex(function(comment) {
                return comment._id == req.body.comment_id;
            });
            // update content and mark that it's been edited
            thread.post[postIndex].comment[commentIndex].content = req.body.content + " (edited)";
            thread.save();
        })
        .then(function() {
            res.redirect(`/thread/${req.params.title}`);
        })
    });

    // uses method override so the form element can make a delete request
    app.delete('/thread/:title/comment', isLoggedIn, function(req, res) {
        Thread.findOne({title: req.params.title})
        .then(function(thread) {
            // find index of the post the comment to be deleted belongs to
            const postIndex = thread.post.findIndex(function(post) {
                // using double equals since post._id is a string and req.body.post_id is an object
                return post._id == req.body.post_id;
            });
            // find index of the comment to be deleted within its post
            const commentIndex = thread.post[postIndex].comment.findIndex(function(comment) {
                return comment._id == req.body.comment_id;
            });
            // remove comment from post using previously found indexes
            thread.post[postIndex].comment.splice(commentIndex, 1);
            thread.save();
        })
        .then(function() {
            res.redirect(`/thread/${req.params.title}`);
        })
    });
    
    // logout
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // to catch all bad requests
    app.use('*', function(req, res) {   
	    res.status(404).render('invalid.ejs')
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
