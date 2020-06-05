const { Router } = require('express');
const { Auth } = require('../middlewares');
const { Company } = require('../../models/company');
const { GlextradeEvent, eventTypes } = require('../../models/glextradeEvent');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

const profileSeenEvent = (currentCompany, company) => {
  const eventParams = {
    date: new Date(),
    type: eventTypes.SEEN_PROFILE,
    data: {
      company: currentCompany.id,
    },
    owner: company,
  };

  const event = new GlextradeEvent(eventParams);

  event.save();
};


const listCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select('name country industry type coverUrl profileUrl');
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

const getCompany = async (req, res) => {
  const { id } = req.params;
  const { currentUser } = req;
  const currentCompany = currentUser.company;
  const profileView = req.query.profile_view;

  const company = await Company.findOne({ _id: id });

  if (company) {
    if (profileView && currentCompany.id !== id) {
      profileSeenEvent(currentCompany, company);
    }
    return res.send(company);
  }
  return ApiHelper.statusNotFound(res, 'Company not found');
};

const linkRoute = (app) => {
  app.use('/companies', route);
  route.get('/', Auth.isAuth, listCompanies);
  route.get('/:id', Auth.needAuth, getCompany);
  route.put('/my_company', Auth.needAuth, updateCompany);
};

module.exports = {
  linkRoute,
};
