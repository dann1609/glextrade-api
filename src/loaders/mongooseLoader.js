const mongoose = require('mongoose');

module.exports = {
  load: () => mongoose.connect('mongodb://localhost/glextrade')
    .then((connection) => {
      // eslint-disable-next-line no-console
      console.log('\n', 'Connected to MongoDB');
      return connection;
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('\n', 'Could nor connect to MongoDB...');
      return { error: error.name };
    }),
};
