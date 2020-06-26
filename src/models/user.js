const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

const { userRef, companyRef } = require('./ref');
const { Session } = require('./session');

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
    minlength: 8,
    maxlength: 1024,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: companyRef,
  },
});

// eslint-disable-next-line func-names
userSchema.methods.generateSession = async function () {
  const token = jwt.sign(_.omit(this.toObject(), ['password']), process.env.JWT_PRIVATE_KEY);
  const session = new Session({ token, user: this.id });

  await session.save();
  return session;
};

const User = mongoose.model(ref, userSchema);

function validateUser(user) {
  const schema = Joi.object({
    email: Joi.string().min(5).max(255).required(),
    password: Joi.string().min(8).max(255).required(),
  }).unknown(true);

  return schema.validate(user);
}

function validateShortUser(user) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  return schema.validate(user);
}

module.exports.userRef = ref;
module.exports.User = User;
module.exports.validateUser = validateUser;
module.exports.validateShortUser = validateShortUser;
