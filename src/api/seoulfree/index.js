const Router = require('@koa/router');

const seoulfree = new Router();
const seoulfreeController = require('./seoulfree.controller');

const checkLoggedIn = require('../../lib/checkLoggedIn');

seoulfree.get('/', checkLoggedIn, seoulfreeController.listPost);
seoulfree.post('/create', checkLoggedIn, seoulfreeController.createPost);
seoulfree.get('/:id', checkLoggedIn, seoulfreeController.listDetailedPost);
seoulfree.delete('/:id', checkLoggedIn, seoulfreeController.deletePost);
seoulfree.patch('/:id', checkLoggedIn, seoulfreeController.updatePost);

module.exports = seoulfree;
