const { Router } = require('express');
const users = require('./routes/users')

module.exports =  () => {
    const app = Router();
    users(app);

    return app;
};