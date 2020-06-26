const { Router } = require('express');
const s3Module = require('./routes/s3');
const authModule = require('./routes/auth');
const usersModule = require('./routes/users');
const companiesModule = require('./routes/companies');
const notificationsModule = require('./routes/notifications');
const messagesModule = require('./routes/messages');

module.exports = () => {
  const app = Router();

  s3Module.linkRoute(app,'/api/s3');
  authModule.linkRoute(app,'/api/auth');
  usersModule.linkRoute(app,'/api/users');
  companiesModule.linkRoute(app,'/api/companies');
  notificationsModule.linkRoute(app,'/api/notifications');
  messagesModule.linkRoute(app ,'/api/messages');

  return app;
};
