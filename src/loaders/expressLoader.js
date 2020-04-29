const express = require('express');
const routes = require('./../api')

const welcomeMesage = {
    message:'Welcome to glextrade api service!'
};

module.exports = {
    load:(app)=>{
        app.use(express.json());

        app.use(routes());

        app.get('/', function(req, res) {
            res.status(200).send(welcomeMesage);
        });

        app.post('/', function(req, res) {
            res.status(200).send(welcomeMesage);
        });

        app.use(function(req, res) {
            res.status(404).send('Sorry cant find that!');
        });
    }
};