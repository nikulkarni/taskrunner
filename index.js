'use strict';
const debug = require('debug');
const log = debug('taskrunner:log');

const server = require('./server');
const port = process.env.PORT || 3000;

const listener = server.listen(port, function () {
    log('Service running on %s:%d', listener.address().address, listener.address().port);
});
