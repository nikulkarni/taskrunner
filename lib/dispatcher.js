const { exec } = require('child_process');
var total = {};
//var child_processes = {};
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
        //child_processes[result.id] = child;
        var start = process.hrtime();
        result.start = start;
        log(`PID ${child.pid}`);
        child.stdout.on('data', function (data) {
            parser.parse(data, result);
        });
        child.stderr.on('data', function (data) {
            result.failed = result.failed + 1;
            parser.parse(data, result);
            log('stderr: ' + data);
        });
        //at exit stdio of child process might still be open
        //close is when they end, close gets called after exit
        child.on('close', function (code, signal) {
            if (signal != null) {
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
            cb(new Error(`Run id ${id} was not found`), null)
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
            cb(new Error(`Run id ${id} was not found`), null)
        } else {
            //const child_proc = child_processes[id];
            if (result.status === 'running' && child_proc !== undefined) {
                log(`Killing process ${result.pid}`);
                process.kill(result.pid,'SIGKILL');

                //child_proc.kill();
                result.status = 'cancelled';
                result.runtime = calculateRunTime(result.start);
                var response = JSON.parse(JSON.stringify(result));
                delete response.start;
                delete response.pid;
                cb(null, response);
            } else {
                cb(new Error(`Run id ${id} already finished execution, it cannot be cancelled anymore`), null)
            }

        }
    },
    getAll: function () { //thought this would be nice to have;
        return total;
    }
};
function calculateRunTime(arrTime) {
    const arr = process.hrtime(arrTime);
    var t = arr[0] + arr[1] / 1000000000 /* convert nanoseconds to seconds*/;
    return t;
}