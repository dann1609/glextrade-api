const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const { userRef, companyRef } = require('./ref');

const ref = userRef;

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please enter a full name'],
    minlength: 5,
    maxlength: 255,
    unique: true,
  },
  password: {
    type: String,
    minlength: 5,
    maxlength: 1024,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: companyRef,
  },
});

const User = mongoose.model(ref, userSchema);

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(5).max(255).required(),
  }).unknown(true);

  return schema.validate(user);
}

module.exports.userRef = ref;
module.exports.User = User;
module.exports.validateUser = validateUser;
