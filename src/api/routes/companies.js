const { Router } = require('express');
const { Auth } = require('../middlewares');
const { Company } = require('../../models/company');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

const listCompanies = async (req, res) => {
  const isAuth = !!req.currentUser;
  console.log(isAuth);
  try {
    const companies = isAuth
      ? await Company.find().populate('users')
      : await Company.find().select('name country industry type coverUrl profileUrl');
    return res.send({ companies });
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


  route.get('/', Auth.isAuth, listCompanies);
  route.put('/my_company', Auth.needAuth, updateCompany);
};

module.exports = {
  listCompanies,
  linkRoute,
};
