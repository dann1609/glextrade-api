const mongoose = require('mongoose');

const { sessionRef, userRef } = require('./ref');

const ref = sessionRef;

const sessionSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: userRef,
  },
});

const Session = mongoose.model(ref, sessionSchema);

module.exports.sessionRef = ref;
module.exports.Session = Session;
