const { Router } = require('express');
const { User, validateUser } = require('../../models/user');
const { Company, validateCompany } = require('../../models/company');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

module.exports = (app) => {
  app.use('/users', route);

  const registrer = async (req, res) => {
    res.header('Access-Control-Allow-Origin', 'true');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
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

      user = new User(queryObject);
      company = new Company(queryObject);

      await user.save();
      await company.save();

      return res.send(user);
    } catch (e) {
      return ApiHelper.status400Error(res, 'Unexpected error');
    }
  };

  route.post('/', registrer);
};
