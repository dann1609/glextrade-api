const { Session } = require('../../models/session');
const ApiHelper = require('../../helpers/apiHelper');

const isAuth = async (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return ApiHelper.statusBadRequest(res, 'No token provided');
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

module.exports = isAuth;
