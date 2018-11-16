'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const { User } = require('../app/models/user.js');
const configDB = require('../config/database.js');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

describe('API endpoints', function() {

    const username = 'exampleUser';
    const password = 'examplePass';

    before(function() {
        console.log('connected to cofigDB.testurl:', configDB.testurl);
        return runServer(configDB.testurl);
    });

    after(function() {
        return closeServer();
    });

    beforeEach(function() {
        const newUser = new User();
        newUser.local.username = username;
        newUser.local.password = newUser.generateHash(password);
        return newUser.save(function(err) {
            if (err)
                throw err;
            });
        
        /*User.create({
                local: {
                    username,
                    password: this.generateHash(password)
                }
        });*/

        /*
        User.generateHash(password).then(password => {
            User.create({
                username,
                password: password
            })
        */
    });
    
    afterEach(function() {
        return User.remove({});
    });

    describe('POST to signup endpoint', function() {

        it('Should redirect if no credentials', function() {
            return chai.request(app)
            .post('/signup')
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path':'/signup'});
                expect(res).to.be.html;
            });
        });

        it('Should redirect if missing username', function() {
            return chai.request(app)
            .post('/signup')
            .send({password})
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path':'/signup'});
                expect(res).to.be.html;
            });
        });

        it('Should redirect if missing password', function() {
            return chai.request(app)
            .post('/signup')
            .send({username})
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path':'/signup'});
                expect(res).to.be.html;
            });
        });

        it('Should redirect if username starts or ends with whitespace', function() {
            return chai.request(app)
            .post('/signup')
            .send({username: ` ${username}`,
                password})
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path':'/signup'});
                expect(res).to.be.html;
            });
        });

        it('Should redirect if password starts or ends with whitespace', function() {
            return chai.request(app)
            .post('/signup')
            .send({username, 
                password: ` ${password}`})
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path':'/signup'});
                expect(res).to.be.html;
            });
        });

        it('Should redirect if password is too short', function() {
            return chai.request(app)
            .post('/signup')
            .send({username,
                password: `short`})
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path':'/signup'});
                expect(res).to.be.html;
            });
        });

        it('Should create a new user', function() {
            return chai.request(app)
            .post('/signup')
            // will cause same username error without altering username since we used this username to create a user before
            .send({username: `${username}2`, 
                password: password})
            .then(function(res) {
                // during tests, session is not held, so when it creates the user and hits the profile endpoint, will go back
                // to '/' instead of going to '/profile' when it hits the isLoggedin middleware
                expect(res).to.nested.include({'res.req.path':'/'});
                expect(res).to.be.html;

                return User.findOne({});
            })
            .then(function(user) {
                // check that user info within database matches submitted info 
                expect(user.local.username).to.equal(username);
                expect(user.validPassword(password)).to.be.true;
            });
        });
    }); // end of describe(POST to signup endpoint)

    describe('GET to signup endpoint', function() {

        it('Should return ejs file for signup page', function() {
            return chai.request(app)
            .get('/signup')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            })
        });
    }); // end of describe('GET to signup endpoint')

    describe('POST to login endpoints', function() {

        it('Should redirect if no credentials', function() {
            return chai.request(app)
            .post('/login')
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path': '/login'});
                expect(res).to.be.html;
            })
        });

        it('Should redirect if missing username', function() {
            return chai.request(app)
            .post('/login')
            .send({password})
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path': '/login'});
                expect(res).to.be.html;
            })
        });

        it('Should redirect if missing password', function() {
            return chai.request(app)
            .post('/login')
            .send({username})
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path': '/login'});
                expect(res).to.be.html;
            })
        });

        it('Should redirect if wrong username', function() {
            return chai.request(app)
            .post('/login')
            .send({username: `${username}2`, password})
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path': '/login'});
                expect(res).to.be.html;
            })
        });

        it('Should redirect if wrong password', function() {
            return chai.request(app)
            .post('/login')
            .send({username, password: `${password}2`})
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path': '/login'});
                expect(res).to.be.html;
            })
        });

        // will redirect to root technically since a session is not held during test
        // therefore, when it hits isloggedin of profile endpoint, will be redirected to root
        it('Should redirect to profile', function() {
            return chai.request(app)
            .post('/login')
            .send({username, password})
            .then(function(res) {
                expect(res).to.nested.include({'res.req.path': '/'});
                expect(res).to.be.html;
            })
        });
    }); // end of describe('POST to login endpoint')

    describe('GET to login endpoint', function() {
        it('Should return ejs for login', function() {
            return chai.request(app)
            .get('/login')
            .then(function(res) {
                expect(res).to.have.status(200);
                expect(res).to.be.html;
            });
        });
    }); // end of describe('GET to login endpoint')
}); // end of describe(API endpoints)