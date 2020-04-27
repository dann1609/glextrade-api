const express = require('express');
const loaders = require('./src/loaders')


const app = express();

const dotenv = require('dotenv');
dotenv.config();

startServer = async ()=>{

    loaders.load(app);

    const port = process.env.PORT || 3000;
    app.listen(port,() => console.log(`
    ############################################
        🚢 Server listening on port: ${port} 🚢️️
    ############################################`
    ));
};

startServer();