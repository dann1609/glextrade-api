const mongoose = require('mongoose');

const { error } = require('./ref');

const ref = error;

const errorTypes = {
  SIGN_UP: 'SIGN_UP',
  SIGN_IN: 'SIGN_IN',
};

const errorSchema = new mongoose.Schema({
  type: {
    type: String,
  },
  message: {
    type: String,
  },
  data: {
    type: Object,
  },
});

const ErrorTracked = mongoose.model(ref, errorSchema);

module.exports.errorRef = ref;
module.exports.errorTypes = errorTypes;
module.exports.ErrorTracked = ErrorTracked;
