const { Router } = require('express');
const { Company } = require('../../models/company');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

const listCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('users');
    return res.send(companies);
  } catch (e) {
    return ApiHelper.status400Error(res, 'Unexpected error');
  }
};
const linkRoute = (app) => {
  app.use('/companies', route);


  route.get('/', listCompanies);
};

module.exports = {
  listCompanies,
  linkRoute,
};
