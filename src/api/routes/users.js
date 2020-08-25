const { Router } = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const { User, validateUser } = require('../../models/user');
const { Company, validateCompany } = require('../../models/company');
const { ErrorTracked, errorTypes } = require('../../models/errorTracked');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

const multipleCompaniesDomain = ['gmail', 'yahoo', 'hotmail', 'aol', 'msn', 'outlook'];

const checkUniqueDomains = (domain) => {
  const uniqueDomain = multipleCompaniesDomain.reduce((acc, multipleCompanyDomain) => acc && !domain.includes(multipleCompanyDomain), true);

  return uniqueDomain;
};

const listUsers = async (req, res) => {
  try {
    const users = await User.find().populate('company');
    return res.send({ users });
  } catch (error) {
    return ApiHelper.statusBadRequest(res, 'Unexpected error');
  }
};

const register = async (req, res) => {
  const errorTracked = new ErrorTracked({
    type: errorTypes.SIGN_UP,
  });

  try {
    const queryObject = {
      ...req.body,
      domain: (req.body.email || '').split('@')[1],
    };

    errorTracked.data = queryObject;

    const { error: errorUser } = validateUser(queryObject);
    const { error: errorCompany } = validateCompany(queryObject);
    const error = errorUser || errorCompany;

    if (error) {
      console.error(error.details);
      errorTracked.message = error.details[0].message;
      errorTracked.save();
      return ApiHelper.statusBadRequest(res, error.details[0].message);
    }

    let company = await Company.findOne({ domain: queryObject.domain });

    if (company && checkUniqueDomains(queryObject.domain)) {
      errorTracked.message = 'Company already registered';
      errorTracked.save();
      return ApiHelper.statusBadRequest(res, 'Company already registered');
    }

    let user = await User.findOne({ email: queryObject.email });

    if (user) {
      errorTracked.message = 'User already registered';
      errorTracked.save();
      return ApiHelper.statusBadRequest(res, 'User already registered');
    }

    company = new Company(queryObject);
    user = new User({ ...queryObject, company: company.id });

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(user.password, salt);

    user.password = hashed;

    company.users.push(user.id);

    await user.save();
    await company.save();

    const session = await user.generateSession();

    return res.send({
      ...session.toObject(),
      user: _.omit({ ...user.toObject(), ...{ company } }, ['password']),
    });
  } catch (error) {
    console.error(error);
    errorTracked.message = 'Unexpected error';
    errorTracked.save();
    return ApiHelper.statusBadRequest(res, 'Unexpected error');
  }
};

const linkRoute = (app, path) => {
  app.use(path, route);

  route.get('/', listUsers);
  route.post('/', register);
};

module.exports = {
  linkRoute,
};
