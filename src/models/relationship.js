const mongoose = require('mongoose');

const { relationRef, companyRef, chatRoomRef } = require('./ref');

const ref = relationRef;

const relationTypes = {
  INVITATION_SEND: 'INVITATION_SEND',
  CONNECTED: 'CONNECTED',
};

const relationSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Please enter relation type'],
  },
  member: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: companyRef,
  }],
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: companyRef,
  },
  chatRoom: {
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: chatRoomRef,
    },
    lastMessage: {
      type: String,
    },
  },
});

const Relationship = mongoose.model(ref, relationSchema);

module.exports.relationRef = ref;
module.exports.Relationship = Relationship;
module.exports.relationTypes = relationTypes;
