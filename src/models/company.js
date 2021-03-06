const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const { companyRef, userRef, relationRef } = require('./ref');

const ref = companyRef;

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter company name'],
    minlength: 1,
    maxlength: 255,
  },
  domain: {
    type: String,
    required: [true, 'Please enter company domain'],
    minlength: 1,
    maxlength: 255,
  },
  country: {
    type: String,
    required: [true, 'Please enter company country'],
  },
  industry: {
    type: String,
    required: [true, 'Please enter company industry'],
  },
  type: {
    type: String,
    required: [true, 'Please enter company type'],
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: userRef,
  },
  ],
  phone: {
    type: String,
  },
  profileUrl: {
    type: String,
  },
  coverUrl: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  extraUrl: [{
    type: Object,
  }],
  uploadingVideo: {
    type: Boolean,
  },
  network: [
    {
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: companyRef,
      },
      relation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: relationRef,
      },
    },
  ],
  ourRelation: {},
  website: {
    type: String,
  },
});

const Company = mongoose.model(ref, companySchema);

function validateCompany(company) {
  const schema = Joi.object({
    name: Joi.string().min(1).max(255).required(),
    country: Joi.string().required(),
    industry: Joi.string().required(),
    type: Joi.string().required(),
    domain: Joi.string().min(1).max(255).required(),
  }).unknown(true);

  return schema.validate(company);
}

module.exports.companyRef = ref;
module.exports.Company = Company;
module.exports.validateCompany = validateCompany;
