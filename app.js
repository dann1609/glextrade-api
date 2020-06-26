const express = require('express');
const loaders = require('./src/loaders');
const socketIO = require('./src/loaders/socketIO')


const app = express();

const dotenv = require('dotenv');

dotenv.config();

const startServer = async () => {
  const { message, error } = await loaders.load(app);

  console.log('\n', error || message, error ? 'Load failed' : '');

  const port = process.env.PORT || 3001;
  const server = app.listen(port, () => console.log(`
    ############################################
        🚢 Server listening on port: ${port} 🚢️️
    ############################################`));

  socketIO.load(server);

};

startServer();
