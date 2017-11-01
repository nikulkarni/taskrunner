'use strict';

const express = require('express'),
    port = process.env.PORT || 3000;
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

const dispatcher = require('./lib/dispatcher');

app.post('/run', (req, res) => {
    log('request', JSON.stringify(req.body));
    if (req.body.testSuite === undefined) {
        res.status(400).send({error: 'Validation Error, expect testSuite in request body'});
    } else {
        res.send(dispatcher.run(req.body.testSuite));
    }
});

app.get('/status/:id', (req, res) => {
    log('request', JSON.stringify(req.params));
    dispatcher.status(req.params.id, function (err, item) {
        if (err) {
            res.status(400).send({error: err.message});
        } else {
            res.send(item);
        }
    });
});
app.post('/cancel', (req, res) => {
    log('request', JSON.stringify(req.body));
    if (req.body.id === null) {
        res.status(400).send({error: 'Validation Error, expect run id in request body'});
    } else {
        dispatcher.cancel(req.body.id, (err, result) => {
            if (err) {
                res.status(400).send({error: err.message});
            } else {
                res.send(result);
            }
        });
    }
});

app.get('/showall', (req, res) => {
    res.send(dispatcher.getAll());
});

const listener = app.listen(port, () => {
    / eslint-disable no-console /
    log('Service running on %s:%d', listener.address().address, listener.address().port);
    / eslint-disable no-console /
});