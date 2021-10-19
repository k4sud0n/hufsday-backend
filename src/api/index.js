const Router = require('@koa/router');

const api = new Router();
const auth = require('./auth');

const main = require('./main');
const seoulfree = require('./seoulfree');

api.use('/auth', auth.routes());

api.use('/main', main.routes());
api.use('/seoulfree', seoulfree.routes());

module.exports = api;
