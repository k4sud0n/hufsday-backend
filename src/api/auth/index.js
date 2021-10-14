const Router = require('@koa/router');

const auth = new Router();
const authController = require('./auth.controller');

auth.post('/register', authController.register);
auth.get('/check', authController.check);
auth.post('/login', authController.login);
auth.post('/logout', authController.logout);

module.exports = auth;
