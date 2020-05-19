const { Router } = require('express');
const s3Module = require('./routes/s3');
const authModule = require('./routes/auth');
const usersModule = require('./routes/users');
const companiesModule = require('./routes/companies');

module.exports = () => {
  const app = Router();
  s3Module.linkRoute(app);
  authModule.linkRoute(app);
  usersModule.linkRoute(app);
  companiesModule.linkRoute(app);

  return app;
};
