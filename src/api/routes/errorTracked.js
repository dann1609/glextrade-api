const { Router } = require('express');
const { Auth } = require('../middlewares');

const { ErrorTracked } = require('../../models/errorTracked');

const route = Router();

const getErrors = async (req, res) => {
  const errors = await ErrorTracked.find();

  res.send({ errors });
};

const linkRoute = (app, path) => {
  app.use(path, route);

  route.get('/', getErrors);
};

module.exports = {
  linkRoute,
};
