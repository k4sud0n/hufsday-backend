const Router = require('@koa/router');

const globalfree = new Router();
const globalfreeController = require('./globalfree.controller');

const checkLoggedIn = require('../../lib/checkLoggedIn');

globalfree.get('/', checkLoggedIn, globalfreeController.listPost);
globalfree.get('/search/:title', checkLoggedIn, globalfreeController.searchPost);
globalfree.post('/create', checkLoggedIn, globalfreeController.createPost);
globalfree.get('/:id', checkLoggedIn, globalfreeController.detailedPost);
globalfree.delete('/:id/delete', checkLoggedIn, globalfreeController.deletePost);
globalfree.patch('/:id/update', checkLoggedIn, globalfreeController.updatePost);
globalfree.post('/:id/thumbs_up', checkLoggedIn, globalfreeController.postThumbsUp);
globalfree.post('/:id/thumbs_down', checkLoggedIn, globalfreeController.postThumbsDown);

globalfree.get('/:id/comments', checkLoggedIn, globalfreeController.listComment);
globalfree.post('/:id/comments/create', checkLoggedIn, globalfreeController.createComment);
globalfree.patch('/:id/comments/:comment_id/delete', checkLoggedIn, globalfreeController.deleteComment);
globalfree.post('/:id/comments/:comment_id/thumbs_up', checkLoggedIn, globalfreeController.commentThumbsUp);

module.exports = globalfree;
