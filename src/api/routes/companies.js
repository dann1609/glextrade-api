const { Router } = require('express');
const { Company } = require('../../models/company');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

module.exports = (app) => {
  app.use('/companies', route);

  const listCompanies = async (req, res) => {
    try {
      const companies = await Company.find().populate('users');
      return res.send(companies);
    } catch (e) {
      return ApiHelper.status400Error(res, 'Unexpected error');
    }
  };

  route.get('/', listCompanies);
};
