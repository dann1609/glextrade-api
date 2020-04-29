const expressLoader = require('./expressLoader');
const mongooseLoader = require('./mongooseLoader');
const ApiHelper = require('../helpers/apiHelper');

module.exports = {
  load: async (app) => {
    // eslint-disable-next-line no-console
    console.log('loading loaders');

    const mongoConnection = await mongooseLoader.load();

    if (mongoConnection.error) {
      app.use((req, res) => {
        ApiHelper.status500Error(res, 'Sorry db is temporally unable!');
      });

      return mongoConnection;
    }

    expressLoader.load(app);


    return { message: 'Successfully loaded.' };
  },
};
