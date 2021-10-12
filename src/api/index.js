const Router = require('@koa/router');

const api = new Router();
const seoulfree = require('./seoulfree');

api.use('/seoulfree', seoulfree.routes());

module.exports = api;
