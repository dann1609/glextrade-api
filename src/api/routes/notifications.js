const { Router } = require('express');
const { Auth } = require('../middlewares');
const { GlextradeEvent } = require('../../models/glextradeEvent');

const route = Router();

const getMyNotifications = async (req, res) => {
  const { currentUser } = req;
  const currentCompany = currentUser.company;

  const notifications = await GlextradeEvent.find({ owner: currentCompany }).populate({
    path: 'data.company',
    model: 'Company',
  });
  return res.send({
    notifications,
  });
};

const setSeenAllNotifications = async (req, res) => {
  const { currentUser } = req;
  const currentCompany = currentUser.company;

  const notifications = await GlextradeEvent.find({ owner: currentCompany });

  const seenNotificationsArray = notifications.map((notification) => {
    const seenNotification = notification;
    seenNotification.seen = true;
    return seenNotification.save();
  });

  const allSeen = await Promise.all(seenNotificationsArray);

  return res.send({
    notifications: allSeen,
  });
};

const linkRoute = (app) => {
  app.use('/notifications', route);
  route.get('/', Auth.needAuth, getMyNotifications);
  route.put('/', Auth.needAuth, setSeenAllNotifications);
};

module.exports = {
  linkRoute,
};
