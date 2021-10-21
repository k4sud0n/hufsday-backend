const Router = require('@koa/router');

const notification = new Router();
const notificationController = require('./notification.controller');

const checkLoggedIn = require('../../lib/checkLoggedIn');

notification.get('/', checkLoggedIn, notificationController.listNotification);
notification.get('/count', checkLoggedIn, notificationController.countNotification);
notification.patch('/:notification_id', checkLoggedIn, notificationController.updateNotification);
notification.delete('/', checkLoggedIn, notificationController.deleteNotification);

module.exports = notification;
