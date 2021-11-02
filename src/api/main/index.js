const Router = require('@koa/router');

const main = new Router();
const mainController = require('./main.controller');

const checkLoggedIn = require('../../lib/checkLoggedIn');

main.get('/', checkLoggedIn, mainController.listPost);

module.exports = main;
