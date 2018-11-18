'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const UserSchema = mongoose.Schema({
    local: {
        username: {
            type: String,
            required: true,
            unique: true
        },
        password: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            default: ''
        },
        lastName: {
            type: String,
            default: ''
        }
    }
});

UserSchema.methods.serialize = function() {
    return {
        username: this.username || '',
        firstName: this.firstName || '',
        lastName: this.lastName || ''
    };
};

// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

const User = mongoose.model('users', UserSchema);

module.exports = { User };