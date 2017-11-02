'use strict';

const { exec } = require('child_process');
const kill = require('tree-kill');
var total = {};
const debug = require('debug');
const log = debug('taskrunner:log');
const parser = require('./parser');
module.exports = {

    run: (testSuite)=> {
        var result = {};

        //build basic result object
        result.id = require('uuid/v1')();
        result.testSuite = testSuite;
        result.status = 'running';
        result.runtime = '0';
        result.passed = 0;
        result.failed = 0;
        result.failedTests = [];

        total[result.id] = result;

        const child = exec('node simpletestrunner ' + testSuite);
        result.pid = child.pid;
        var start = process.hrtime();
        result.start = start;
        log(`PID ${child.pid}`);
        child.stdout.on('data',  (data) => {
            parser.parse(data, result);
        });
        child.stderr.on('data',  (data) => {
            result.failed = result.failed + 1;
            parser.parse(data, result);
            log('stderr: ' + data);
        });
        //at exit stdio of child process might still be open
        //close is when they end, close gets called after exit
        child.on('close',  (code, signal) => {
            log(signal);
            if (signal !== null && signal !== undefined) {
                result.status = 'cancelled';
                log(`child process terminated with ${code} due to receipt of signal ${signal}`);
            } else {
                result.status = 'completed';
                result.runtime = calculateRunTime(start);
                log(result);
            }
        });
        var response = JSON.parse(JSON.stringify(result));
        delete response.pid; //don't expose this to clients;
        delete response.start;
        return response;
    },
    status: (id, cb) => {

        var result = total[id];
        if (result === undefined) {
            cb(new Error(`Run id ${id} was not found`), null);
        } else {
            var response = JSON.parse(JSON.stringify(result));
            if (response.status === 'running') {
                response.runtime = calculateRunTime(response.start);
            }
            delete response.start;
            delete response.pid;
            cb(null, response);
        }

    },
    cancel: (id, cb) => {
        var result = total[id];
        if (result === undefined) {
            cb(new Error(`Run id ${id} was not found`), null);
        } else {
            if (result.status === 'running' && result.pid !== undefined) {
                log(`Killing process ${result.pid}`);
                kill(result.pid, 'SIGKILL');
                result.status = 'cancelled';
                result.runtime = calculateRunTime(result.start);
                var response = JSON.parse(JSON.stringify(result));
                delete response.start;
                delete response.pid;
                cb(null, response);
            } else {
                if(result.status === 'cancelled') {
                    cb(new Error(`Run id ${id} is already cancelled, cannot be cancelled anymore`), null);
                } else {
                    cb(new Error(`Run id ${id} is already finished execution, cannot be cancelled anymore`), null);
                }
            }

        }
    },
    getAll:  () => { //thought this would be nice to have;
        return total;
    }
};
function calculateRunTime(arrTime) {
    const arr = process.hrtime(arrTime);
    var t = arr[0] + arr[1] / 1000000000 /* convert nanoseconds to seconds*/;
    return t;
}