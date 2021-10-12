const Router = require('@koa/router');

const seoulfree = new Router();
const seoulfreeController = require('./seoulfree.controller');

seoulfree.get('/', seoulfreeController.listPost);
seoulfree.post('/create', seoulfreeController.createPost);
seoulfree.get('/:id', seoulfreeController.listDetailedPost);
seoulfree.delete('/:id', seoulfreeController.deletePost);
seoulfree.patch('/:id', seoulfreeController.updatePost);

module.exports = seoulfree;
