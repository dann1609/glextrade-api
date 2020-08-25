const mongoose = require('mongoose');

const { chatRoomRef } = require('./ref');

const ref = chatRoomRef;

const chatRoomSchema = new mongoose.Schema({
  data: [{
    type: Object,
  }],
  lastMessage: {
    type: String,
  },
});

const ChatRoom = mongoose.model(ref, chatRoomSchema);

module.exports.chatRoomRef = ref;
module.exports.ChatRoom = ChatRoom;
