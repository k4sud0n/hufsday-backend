const Router = require('@koa/router');

const message = new Router();
const messageController = require('./message.controller');

const checkLoggedIn = require('../../lib/checkLoggedIn');

message.get('/', checkLoggedIn, messageController.listMessage);
message.get('/count', checkLoggedIn, messageController.countMessage);
message.get('/:id', checkLoggedIn, messageController.detailedMessage);
message.post('/create', checkLoggedIn, messageController.createMessage);
message.delete('/delete', checkLoggedIn, messageController.deleteAllMessage);

module.exports = message;
