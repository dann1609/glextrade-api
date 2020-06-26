const { Router } = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const { User, validateUser } = require('../../models/user');
const { Company, validateCompany } = require('../../models/company');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

const listUsers = async (req, res) => {
  try {
    const users = await User.find().populate('company');
    return res.send({ users });
  } catch (error) {
    return ApiHelper.statusBadRequest(res, 'Unexpected error');
  }
};

const register = async (req, res) => {
  try {
    const queryObject = {
      ...req.body,
      domain: (req.body.email || '').split('@')[1],
    };

    const { error: errorUser } = validateUser(queryObject);
    const { error: errorCompany } = validateCompany(queryObject);
    const error = errorUser || errorCompany;

    if (error) {
      console.error(error.details);
      return ApiHelper.statusBadRequest(res, error.details[0].message);
    }

    let company = await Company.findOne({ domain: queryObject.domain });

    if (company) {
      return ApiHelper.statusBadRequest(res, 'Company already registered');
    }

    let user = await User.findOne({ email: queryObject.email });

    if (user) {
      return ApiHelper.statusBadRequest(res, 'User already registered.');
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
    return ApiHelper.statusBadRequest(res, 'Unexpected error');
  }
};

const linkRoute = (app,path) => {
  app.use(path, route);

  route.get('/', listUsers);
  route.post('/', register);
};

module.exports = {
  linkRoute,
};
