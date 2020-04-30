const { Router } = require('express');
const authModule = require('./routes/auth');
const usersModule = require('./routes/users');
const companiesModule = require('./routes/companies');

module.exports = () => {
  const app = Router();
  authModule.linkRoute(app);
  usersModule.linkRoute(app);
  companiesModule.linkRoute(app);

  return app;
};
