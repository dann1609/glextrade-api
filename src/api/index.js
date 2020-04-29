const { Router } = require('express');
const users = require('./routes/users');
const companies = require('./routes/companies');

module.exports = () => {
  const app = Router();
  users(app);
  companies(app);

  return app;
};
