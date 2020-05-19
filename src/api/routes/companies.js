const { Router } = require('express');
const { Company } = require('../../models/company');
const { Session } = require('../../models/session');
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
const updateCompany = async (req, res) => {
  const queryObject = req.body;

  const session = await Session.findOne({ token: queryObject.token }).populate('user');
  const user = await session.user.populate('company').execPopulate();
  const { company } = user;

  company.profileUrl = queryObject.profileUrl || company.profileUrl;
  company.coverUrl = queryObject.coverUrl || company.coverUrl;
  company.videoUrl = queryObject.videoUrl || company.videoUrl;

  await company.save();

  res.send(company);
};

const linkRoute = (app) => {
  app.use('/companies', route);


  route.get('/', listCompanies);
  route.put('/my_company', updateCompany);
};

module.exports = {
  listCompanies,
  linkRoute,
};
