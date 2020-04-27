//const express = require('express');

module.exports = {
    load:(app)=>{
        //app.use(express.json);

        //app.use(routes)

        app.get('/', function(req, res) {
            res.status(200).send('Welcome to glextrade api service!');
        });

        app.use(function(req, res) {
            res.status(404).send('Sorry cant find that!');
        });
    }
}