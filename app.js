const express = require('express');
const loaders = require('./src/loaders');


const app = express();

const dotenv = require('dotenv');

dotenv.config();

const startServer = async () => {
  const { message, error } = await loaders.load(app);

  console.log('\n', error || message, error ? 'Load failed' : '');

  const port = process.env.PORT || 3001;
  app.listen(port, () => console.log(`
    ############################################
        🚢 Server listening on port: ${port} 🚢️️
    ############################################`));
};

startServer();
