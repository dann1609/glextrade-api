const { Router } = require("express");
const { Auth } = require("../middlewares");
const { GlextradeEvent, statusTypes } = require("../../models/glextradeEvent");

const route = Router();

const getMyNotifications = async (req, res) => {
  const { currentUser } = req;
  const currentCompany = currentUser.company;

  const notifications = await GlextradeEvent.find({
    owner: currentCompany,
  }).populate({
    path: "data.company",
    model: "Company",
  });

  const activeNotifications = [];
  const now = new Date();

  notifications.map((notification) => {
    if (notification.seen) {
      const difference = now - notification.seen_date;

      console.log(now, notification.seen_date, difference, difference > 0);
      if (difference > 1000 * 60 * 60 * 24) {
        notification.delete();
        return null;
      }
    }
    activeNotifications.push(notification);

    return null;
  });

  return res.send({
    notifications: activeNotifications,
  });
};

const setSeenAllNotifications = async (req, res) => {
  const { currentUser } = req;
  const currentCompany = currentUser.company;

  const notifications = await GlextradeEvent.find({ owner: currentCompany });

  const seenNotificationsArray = notifications.map((notification) => {
    const seenNotification = notification;
    seenNotification.seen = true;
    if (!seenNotification.seen_date) {
      seenNotification.seen_date = new Date();
    }

    return seenNotification.save();
  });

  const allSeen = await Promise.all(seenNotificationsArray);

  return res.send({
    notifications: allSeen,
  });
};

const changeNotificationsStatus = async (req, res) => {
  const { id } = req.params;
  var query = { _id: id };
  const queryObject = req.body;
  const { status } = queryObject;

  GlextradeEvent.findOneAndUpdate(
    query,
    { status: status },
    { upsert: true },
    function (err, doc) {
      if (err) return res.send(500, { error: err });
      return res.send("Succesfully declined.");
    }
  );
};

const deleteNotifications = async (req, res) => {
  const { id } = req.params;
  const { currentUser } = req;
  const currentCompany = currentUser.company;

  const notification = await GlextradeEvent.findOne({ _id: id });

  if (notification) {
    await notification.delete();
  }

  const notifications = await GlextradeEvent.find({ owner: currentCompany });

  res.send({
    notifications,
  });
};

const linkRoute = (app, path) => {
  app.use(path, route);
  route.get("/", Auth.needAuth, getMyNotifications);
  route.put("/", Auth.needAuth, setSeenAllNotifications);
  route.put("/changeStatus/:id", Auth.needAuth, changeNotificationsStatus);
  route.delete("/:id", Auth.needAuth, deleteNotifications);
};

module.exports = {
  linkRoute,
};
