const Router = require('@koa/router');

const auth = new Router();
const authController = require('./auth.controller');

const checkLoggedIn = require('../../lib/checkLoggedIn');

auth.post('/register', authController.register);
auth.post('/authorization', checkLoggedIn, authController.authorizaiton);
auth.get('/check', authController.check);
auth.post('/login', authController.login);
auth.post('/logout', authController.logout);

module.exports = auth;
