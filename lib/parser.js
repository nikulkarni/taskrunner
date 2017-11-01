const async = require('async');
const debug = require('debug');
const log = debug('taskrunner:log');

module.exports = {

  parse : function(data, result) {

      const passed = 'Passed: ';
      const failed = 'Failed: ';
      const testKey = /Test '/gi;
      const passedKey = /Passed: /g;
      const failedKey = /Failed: /g;
      var startIndex = 0;
      var endIndex = 0;
      var testResult;
      result.passed = result.passed || 0;
      result.failed = result.failed || 0;
      result.failedTests = result.failedTests || [];

      async.whilst(function () {
          return testResult = testKey.exec(data);
      }, function (callback) {
          startIndex = data.indexOf("'", testResult.index);
          endIndex = data.indexOf("'", startIndex + 1);
          const failedTest = data.substring(startIndex + 1, endIndex);
          result.failedTests.push(failedTest);
          callback(null, null);
      }, function (err) {
          if(err) {
              throw err;
          }
      });
      if (passedKey.exec(data)) {
          startIndex = data.indexOf(passed);
          endIndex = data.indexOf(failed, startIndex + 1);
          if (endIndex === -1) { //means no 'Failed'
              endIndex = data.length;
              result.failed = 0;
          } else {
              result.failed = result.failed + Number(data.substring(endIndex + failed.length, data.length));
          }
          result.passed = Number(data.substring(startIndex + passed.length, endIndex));
      } else if (failedKey.exec(data)) { //means no Pass
          startIndex = data.indexOf(failed);
          endIndex = data.length;
          result.passed = 0;
          result.failed = result.failed + Number(data.substring(startIndex + failed.length, endIndex));
      }
      log('stdout: ' + data);
  }

};