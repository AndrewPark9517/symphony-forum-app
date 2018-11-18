'use strict';

const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    content: String,
    created: {type: Date, default: Date.now()},
 });
 
 const postSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    content: String,
    created:{type: Date, default: Date.now()},
    comment: [commentSchema]
 });
 
 // thread will receive an id from mongo database
 const threadSchema = mongoose.Schema({
    title: String,
    post: [postSchema]
 });
 
 threadSchema.pre('find', function(next) {
    this.populate('post.user');
    this.populate('post.comment.user');
    next();
 });
 
 threadSchema.pre('findOne', function(next) {
    this.populate('post.user');
    this.populate('post.comment.user');
    next();
 });

 const Thread = mongoose.model('threads', threadSchema);
 
 module.exports = { Thread };