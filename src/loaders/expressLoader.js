const express = require('express');
const routes = require('../api');
const ApiHelper = require('../helpers/apiHelper');

const welcomeMesage = {
  message: 'Welcome to glextrade api service!',
};

module.exports = {
  load: (app) => {
    app.use(express.json());

    app.use(routes());

    app.get('/', (req, res) => {
      res.status(200).send(welcomeMesage);
    });

    app.post('/', (req, res) => {
      res.status(200).send(welcomeMesage);
    });

    app.use((req, res) => {
      ApiHelper.statusNotFound(res, 'Sorry cant find that!');
    });
  },
};
