const Router = require('@koa/router');

const api = new Router();
const auth = require('./auth');

const main = require('./main');
const notification = require('./notification');
const seoulfree = require('./seoulfree');

api.use('/auth', auth.routes());

api.use('/main', main.routes());
api.use('/notification', notification.routes());
api.use('/seoulfree', seoulfree.routes());

module.exports = api;
