const mongoose = require('mongoose');

const { eventRef, companyRef } = require('./ref');

const ref = eventRef;

const eventTypes = {
  SEEN_PROFILE: 'SEEN_PROFILE',
};

const eventSchema = new mongoose.Schema({
  date: {
    type: Date,
  },
  type: {
    type: String,
  },
  message: {
    type: String,
  },
  data: {
    type: Object,
  },
  seen: {
    type: Boolean,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: companyRef,
  },
});

const GlextradeEvent = mongoose.model(ref, eventSchema);

module.exports.eventRef = ref;
module.exports.GlextradeEvent = GlextradeEvent;
module.exports.eventTypes = eventTypes;
