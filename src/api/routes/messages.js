const { Router } = require('express');
const { Auth } = require('../middlewares');

const { ChatRoom } = require('../../models/chatRoom');
const { Relationship } = require('../../models/relationship');

const route = Router();

const getMessages = async (req, res) => {
  const { id } = req.params;

  const chatRoom = await ChatRoom.findOne({ _id: id });

  res.send(chatRoom);
};

const sendMessage = async (req, res) => {
  const { id } = req.params;

  const queryObject = req.body;
  const { currentUser } = req;
  const { company } = currentUser;

  const chatRoom = await ChatRoom.findOne({ _id: id });
  const relationship = await Relationship.findOne({ 'chatRoom._id': id });

  chatRoom.data.push({
    message: queryObject.message,
    owner: company.id,
  });

  chatRoom.lastMessage = queryObject.message;

  await chatRoom.save();

  relationship.chatRoom = chatRoom;

  await relationship.save();

  return res.send({
    message: queryObject.message,
    owner: company.id,
  });
};

const linkRoute = (app, path) => {
  app.use(path, route);

  route.get('/:id', Auth.needAuth, getMessages);
  route.post('/:id', Auth.needAuth, sendMessage);
};

module.exports = {
  linkRoute,
};
