const mongoose = require('mongoose');

const { eventRef, companyRef } = require('./ref');

const ref = eventRef;

const eventTypes = {
  SEEN_PROFILE: 'SEEN_PROFILE',
  CONNECTION_REQUEST: 'CONNECTION_REQUEST',
  CONNECTION_ACCEPTED: 'CONNECTION_ACCEPTED',
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

const getDefaultCompanyEventParams = (eventType, currentCompany, company) => ({
  date: new Date(),
  type: eventType,
  data: {
    company: currentCompany.id,
  },
  owner: company,
});

module.exports.eventRef = ref;
module.exports.GlextradeEvent = GlextradeEvent;
module.exports.eventTypes = eventTypes;
module.exports.getDefaultCompanyEventParams = getDefaultCompanyEventParams;
