const { Router } = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const { Auth } = require('../middlewares');

const { User, validateShortUser } = require('../../models/user');
const ApiHelper = require('../../helpers/apiHelper');

const route = Router();

const auth = async (req, res) => {
  try {
    const queryObject = req.body;
    const { error } = validateShortUser(queryObject);

    if (error) {
      return ApiHelper.statusBadRequest(res, error.details[0].message);
    }

    const user = await User.findOne({ email: queryObject.email }).populate('company');

    if (!user) {
      return ApiHelper.statusBadRequest(res, 'Invalid email or password');
    }

    const validPassword = await bcrypt.compare(queryObject.password, user.password);

    if (!validPassword) {
      return ApiHelper.statusBadRequest(res, 'Invalid email or password');
    }

    user.company = await user.company.populate('network.relation').execPopulate();
    user.company = await user.company.populate('network.company').execPopulate();

    const session = await user.generateSession();

    return res.send({ ...session.toObject(), user: _.omit(user.toObject(), ['password']) });
  } catch (error) {
    return ApiHelper.statusBadRequest(res, 'Unexpected error');
  }
};

const updateAuth = async (req, res) => {
  const { currentUser } = req;

  currentUser.company = await currentUser.company.populate('network.relation').execPopulate();
  currentUser.company = await currentUser.company.populate('network.company').execPopulate();

  res.send(currentUser);
};
const linkRoute = (app) => {
  app.use('/auth', route);

  route.get('/', Auth.needAuth, updateAuth);
  route.post('/', auth);
};

module.exports = {
  linkRoute,
};
