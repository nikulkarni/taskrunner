'use strict';

const express = require('express');
const app = express();


const bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({extended: true})); // support encoded bodies
app.use(errorHandler);

function errorHandler(err, req, res, next) {
    res.status(500).send({error: err});
    next(err);
}

const debug = require('debug');
const log = debug('taskrunner:log');

const dispatcher = require('../lib/dispatcher');

app.post('/task', (req, res) => {
    log('request', JSON.stringify(req.body));
    if (req.body.action === undefined) {
        res.status(400).send({error: 'Validation Error, please provide an action from {run, cancel}'});
    } else {
        if (req.body.action === 'run') {
            if (req.body.testSuite === undefined) {
                res.status(400).send({error: 'Validation Error, expect testSuite in request body'});
            } else {
                res.send(dispatcher.run(req.body.testSuite));
            }
        } else if (req.body.action === 'cancel') {
            if (req.body.id === undefined) {
                res.status(400).send({error: 'Validation Error, expect run id in request body'});
            }
            else {
                dispatcher.cancel(req.body.id, (err, result) => {
                    if (err) {
                        res.status(400).send({error: err.message});
                    } else {
                        res.send(result);
                    }
                });
            }
        } else {
            res.status(400).send({error: 'Validation Error, please check the input'});
        }
    }

});

app.get('/task/status/:id', (req, res) => {
    log('request', JSON.stringify(req.params));
    dispatcher.status(req.params.id, function (err, item) {
        if (err) {
            res.status(400).send({error: err.message});
        } else {
            res.send(item);
        }
    });
});

app.get('/task/history', (req, res) => {
    res.send(dispatcher.getAll());
});
module.exports = app;