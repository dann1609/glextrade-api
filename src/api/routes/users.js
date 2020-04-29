const { Router } = require('express');
const { User, validateUser } = require('../../models/user');
const { Company, validateCompany } = require('../../models/company');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

module.exports = (app) => {
  app.use('/users', route);

  const listUsers = async (req, res) => {
    try {
      const users = await User.find().populate('company');
      return res.send(users);
    } catch (e) {
      return ApiHelper.status400Error(res, 'Unexpected error');
    }
  };

  const registrer = async (req, res) => {
    try {
      const queryObject = {
        ...req.body,
        domain: (req.body.email || '').split('@')[1],
      };
      const { error: errorUser } = validateUser(queryObject);
      const { error: errorCompany } = validateCompany(queryObject);
      const error = errorUser || errorCompany;

      if (error) {
        return ApiHelper.status400Error(res, error.details[0].message);
      }

      let company = await Company.findOne({ domain: queryObject.domain });

      if (company) {
        return ApiHelper.status400Error(res, 'Company already registered');
      }

      let user = await User.findOne({ email: queryObject.email });

      if (user) {
        return ApiHelper.status400Error(res, 'User already registered.');
      }

      company = new Company(queryObject);
      user = new User({ ...queryObject, ...{ company: company.id } });

      company.users.push(user.id);

      await user.save();
      await company.save();

      return res.send(user);
    } catch (e) {
      return ApiHelper.status400Error(res, 'Unexpected error');
    }
  };

  route.get('/', listUsers);
  route.post('/', registrer);
};
