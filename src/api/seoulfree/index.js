const Router = require('@koa/router');

const seoulfree = new Router();
const seoulfreeController = require('./seoulfree.controller');

const checkLoggedIn = require('../../lib/checkLoggedIn');

seoulfree.get('/', checkLoggedIn, seoulfreeController.listPost);
seoulfree.post('/create', checkLoggedIn, seoulfreeController.createPost);
seoulfree.get('/:id', checkLoggedIn, seoulfreeController.listDetailedPost);
seoulfree.delete('/:id/delete', checkLoggedIn, seoulfreeController.deletePost);
seoulfree.patch('/:id/update', checkLoggedIn, seoulfreeController.updatePost);
seoulfree.post('/:id/thumbs_up', checkLoggedIn, seoulfreeController.postThumbsUp);
seoulfree.post('/:id/thumbs_down', checkLoggedIn, seoulfreeController.postThumbsDown);

seoulfree.get('/:id/comments', checkLoggedIn, seoulfreeController.listComment);
seoulfree.post('/:id/comments/create', checkLoggedIn, seoulfreeController.createComment);
seoulfree.delete('/:id/comments/:comment_id/delete', checkLoggedIn, seoulfreeController.deleteComment);
seoulfree.post('/:id/comments/:comment_id/thumbs_up', checkLoggedIn, seoulfreeController.commentThumbsUp);

module.exports = seoulfree;
