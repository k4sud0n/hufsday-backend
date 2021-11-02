const Router = require('@koa/router');

const api = new Router();
const auth = require('./auth');

const main = require('./main');
const message = require('./message');
const notification = require('./notification');
const seoulfree = require('./seoulfree');
const globalfree = require('./globalfree');

api.use('/auth', auth.routes());

api.use('/main', main.routes());
api.use('/message', message.routes());
api.use('/notification', notification.routes());

api.use('/seoulfree', seoulfree.routes());
api.use('/globalfree', globalfree.routes());

module.exports = api;
