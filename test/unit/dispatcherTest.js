'use strict';

const dispatcher = require('../../lib/dispatcher');
const expect = require('chai').expect;

describe('@dispatcherAndParser@ functionality', function () {

    it('should be able to run @testSuite1@', function (done) {
        const actualResult = dispatcher.run('testSuite1');
        const expectedResult = {
            id: actualResult.id,
            status: 'running',
            testSuite: 'testSuite1',
            passed: 0,
            failed: 0,
            failedTests: []
        };
        validateTestRunResult(actualResult, expectedResult, true);
        done();
    });

    it('should be able to run and get @testSuite1Status@', function (done) {
        const result = dispatcher.run('testSuite1');
        const expectedResult = {
            id: result.id,
            status: 'completed',
            testSuite: 'testSuite1',
            passed: 10,
            failed: 0,
            failedTests: []
        };
        waitForTestRunTobeOverThenVerify(expectedResult, 6000, done);
    });
    it('should be able to run testSuite1 and  @cancelTestSuite1@', function (done) {
        const result = dispatcher.run('testSuite1');
        const expectedResult = {
            id: result.id,
            status: 'cancelled',
            testSuite: 'testSuite1',
            passed: 0,
            failed: 0,
            failedTests: []
        };
        dispatcher.cancel(result.id, function (err, actualResult) {
            if (err) {
                done(err);
            } else {
                console.log('cancelled test suite', actualResult);
                expect(actualResult).to.deep.includes(expectedResult);
                done();
            }
        });
    });

    it('should get an error when @cancellingNonExistentRun@', function (done) {
        dispatcher.cancel('123', function (err, actualResult) {
            if (err) {
                console.log(err.message);
                done();
            } else {
                done(new Error('Did not expect to pass'));
            }
        });
    });

    it('should get an error when @cancellingCompletedRun@', function (done) {
        const result = dispatcher.run('testSuite7');
        setTimeout(function () {
            dispatcher.cancel(result.id, function (err, actualResult) {
                if (err) {
                    console.log(err.message);
                    done();
                } else {
                    done(new Error('Did not expect to pass'));
                }
            });
        }, 3000);
    });

    it('should get an error when @requestingStatusOfNonExistentRun@', function (done) {
        dispatcher.status('12334', function (err, actualResult) {
            if (err) {
                console.log(err.message);
                done();
            } else {
                done(new Error('Did not expect to pass'));
            }
        });
    });


    it('should  be able to run and get @testSuite2Status@', function (done) {
        const result = dispatcher.run('testSuite2');
        const expectedResult = {
            id: result.id,
            status: 'completed',
            testSuite: 'testSuite2',
            passed: 8,
            failed: 2,
            failedTests: ['UsernameCannotExceed64Bytes',
                'ModifyUsernameForExistingProfile']
        };
        waitForTestRunTobeOverThenVerify(expectedResult, 6000, done);
    });
    it('should  be able to run and get @testSuite3Status@', function (done) {
        const result = dispatcher.run('testSuite3');
        const expectedResult = {
            id: result.id,
            status: 'completed',
            testSuite: 'testSuite3',
            passed: 0,
            failed: 6,
            failedTests: ['CreateSocialGraphEmptyUserTable',
                'CreateSocialGraphSparseUserTable',
                'CreateSocialGraphFullUserTable',
                'RecalcSocialGraphEmptyUserTable',
                'RecalcSocialGraphSparseUserTable',
                'RecalcSocialGraphFullUserTable']
        };
        waitForTestRunTobeOverThenVerify(expectedResult, 6000, done);
    });
    it('should run and get @testSuite5Status@', function (done) {
        const result = dispatcher.run('testSuite5');
        const expectedResult = {
            id: result.id,
            status: 'completed',
            testSuite: 'testSuite5',
            passed: 0,
            failed: 1,
            failedTests: []
        };
        waitForTestRunTobeOverThenVerify(expectedResult, 6000, done);
    });

    it('should run and get @testSuite6Status@', function (done) {
        const result = dispatcher.run('testSuite6');
        const expectedResult = {
            id: result.id,
            status: 'completed',
            testSuite: 'testSuite6',
            passed: 0,
            failed: 1,
            failedTests: ['ReindexGraphTable']
        };
        waitForTestRunTobeOverThenVerify(expectedResult, 6000, done);
    });

    it('should run and get all status @testSuite6AllStatus@', function (done) {
        const result = dispatcher.run('testSuite6');
        const expectedResult = {
            id: result.id,
            status: 'completed',
            testSuite: 'testSuite6',
            passed: 0,
            failed: 1,
            failedTests: ['ReindexGraphTable']
        };
        setTimeout(function () {
            const allRuns = dispatcher.getAll();
            const actualResult = allRuns[expectedResult.id];
            expect(actualResult.pid).to.not.be.undefined;
            expect(actualResult).to.deep.includes(expectedResult);
            done();
        }, 3000);

    });
});
function validateTestRunResult(runResult, expectedResult) {
    console.log(runResult);

    expect(runResult).to.not.be.undefined;
    expect(runResult.id).to.not.be.undefined;
    expect(runResult.testSuite).to.not.be.undefined;
    expect(runResult.runtime).to.not.be.undefined;
    expect(runResult.failedTests).to.not.be.undefined;

    expect(runResult).to.deep.includes(expectedResult);

};
function waitForTestRunTobeOverThenVerify(expectedResult, timeout, done) {
    console.log('expected', expectedResult);
    setTimeout(function () {
        dispatcher.status(expectedResult.id, function (err, actualResult) {
            if (err) {
                done(err);
            } else {
                //status should not return pid to the caller;
                expect(actualResult.pid).to.be.undefined;
                validateTestRunResult(actualResult, expectedResult);
                done();
            }
        });
    }, timeout);
}