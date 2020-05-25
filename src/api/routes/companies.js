const { Router } = require('express');
const { isAuth } = require('../middlewares');
const { Company } = require('../../models/company');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

const listCompanies = async (req, res) => {
  try {
    const companies = await Company.find().populate('users');
    return res.send(companies);
  } catch (error) {
    return ApiHelper.statusBadRequest(res, 'Unexpected error');
  }
};

const updateCompany = async (req, res) => {
  const queryObject = req.body;
  const { currentUser } = req;
  const { company } = currentUser;

  Object.assign(company, queryObject);

  try {
    const savedCompany = await company.save();

    res.send(savedCompany);
  } catch (error) {
    console.error(error);
    ApiHelper.statusInternalServerError(res, error.message);
  }
};

const linkRoute = (app) => {
  app.use('/companies', route);


  route.get('/', listCompanies);
  route.put('/my_company', isAuth, updateCompany);
};

module.exports = {
  listCompanies,
  linkRoute,
};
