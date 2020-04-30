const { Router } = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const { User, validateShortUser } = require('../../models/user');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

const auth = async (req, res) => {
  try {
    const queryObject = req.body;
    const { error } = validateShortUser(queryObject);

    if (error) {
      return ApiHelper.status400Error(res, error.details[0].message);
    }

    const user = await User.findOne({ email: queryObject.email });

    if (!user) {
      return ApiHelper.status400Error(res, 'Invalid email or password');
    }

    const validPassword = await bcrypt.compare(queryObject.password, user.password);

    if (!validPassword) {
      return ApiHelper.status400Error(res, 'Invalid email or password');
    }

    const session = await user.generateSession();

    return res.send({ ...session.toObject(), user: _.omit(user.toObject(), ['password']) });
  } catch (e) {
    return ApiHelper.status400Error(res, 'Unexpected error');
  }
};
const linkRoute = (app) => {
  app.use('/auth', route);

  route.post('/', auth);
};

module.exports = {
  linkRoute,
};
