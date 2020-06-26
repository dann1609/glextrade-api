const { Session } = require('../../models/session');
const ApiHelper = require('../../helpers/apiHelper');

const isAuth = async (req, res, next, params) => {
  const { isRequired } = params || {};

  const token = req.header('Authorization');
  if (!token) {
    if (isRequired) {
      return ApiHelper.statusBadRequest(res, 'No token provided');
    }
    next();
  }

  const session = await Session.findOne({ token }).populate('user');

  if (!session) {
    return ApiHelper.statusUnauthorized(res, 'Token are not valid.');
  }
  if (!session.user) {
    return ApiHelper.statusNotFound(res, 'User not found');
  }

  const user = await session.user.populate('company').execPopulate();

  req.currentUser = user;
  if (!user.company) {
    return ApiHelper.statusNotFound(res, 'Company not found');
  }
  return next();
};

const needAuth = async (req, res, next) => {
  const isRequired = true;
  await isAuth(req, res, next, {
    isRequired,
  });
};

module.exports = {
  isAuth,
  needAuth,
};
