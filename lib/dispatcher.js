const { exec } = require('child_process');
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
        result.status = 'scheduled';
        result.runtime = 'tbd';
        result.passed = 0;
        result.failed = 0;
        result.failedTests = [];

        total[result.id] = result;

        const child = exec('node simpletestrunner ' + testSuite);
        result.pid = child.pid;


        var start = process.hrtime();
        child.stdout.on('data', function (data) {
            result.status = 'running';
            parser.parse(data, result);
        });
        child.stderr.on('data', function (data) {
            result.status = 'running';
            result.failed = result.failed + 1;
            parser.parse(data, result);
            log('stderr: ' + data);
        });
        //at exit stdio of child process might still be open
        //close is when they end, close gets called after exit
        child.on('close', function (code, signal) {
            const arr = process.hrtime(start);
            var t = arr[0] + arr[1] / 1000000000 /* convert nanoseconds to seconds*/;
            result.runtime = t + 's';
            log(t);
            if (signal != null) {
                result.status = 'cancelled';
                log(`child process terminated with ${code} due to receipt of signal ${signal}`);
            } else {
                result.status = 'completed';
                log(JSON.stringify(result));
            }
        });
        var response = JSON.parse(JSON.stringify(result));
        delete response.pid;
        return response;
    },
    status: (id, cb) => {

        var result = total[id];
        if (result === undefined) {
            cb(new Error(`Run id ${id} was not found`), null)
        } else {
            var response = JSON.parse(JSON.stringify(result));
            delete response.pid;
            cb(null, response);
        }

    },
    cancel: (id, cb) => {
        var result = total[id];
        if (result === undefined) {
            cb(new Error(`Run id ${id} was not found`), null)
        } else {
            if (result.status === 'running' || result.status === 'scheduled') {
                process.kill(result.pid);
                result.status = 'cancelled';
                cb(null, result);
            } else {
                cb(new Error(`Run id ${id} already finished execution`), null)
            }

        }
    },
    getAll: function () {
        return total;
    }
}
