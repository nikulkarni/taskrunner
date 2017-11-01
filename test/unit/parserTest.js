'use strict';

const parser = require('../../lib/parser');
const expect = require('chai').expect;

describe('@parser@ functionality', function () {

    it('should parse just @passedFailed@', function (done) {
        var data = 'Passed: 10 Failed: 0';
        var result = {};
        parser.parse(data, result);
        expect(result).to.have.property('passed').to.equal(10);
        expect(result).to.have.property('failed').to.equal(0);
        done();
    });
    it('should parse just @passed@', function (done) {
        var data = 'Passed: 0';
        var result = {};
        parser.parse(data, result);
        expect(result).to.have.property('passed').to.equal(0);
        expect(result).to.have.property('failed').to.equal(0);
        done();
    });

    it('should parse just @failed@', function (done) {
        var data = 'Failed: 1';
        var result = {};
        parser.parse(data, result);
        expect(result).to.have.property('passed').to.equal(0);
        expect(result).to.have.property('failed').to.equal(1);
        done();
    });

    it('should parse  @passedFailedAndTest@', function (done) {
        var data = "Test 'UsernameCannotExceed64Bytes' failed with TestAssertionException." +
            "Reason: Profile creation succeeded, but should have failed." +
            "Test 'ModifyUsernameForExistingProfile' failed with ArrayIndexOutOfBoundsException." +
            "Reason: Index: 2 Length: 2." +
            "Passed: 8 Failed: 2";
        var result = {};
        var expectedFailedTests = [
            'UsernameCannotExceed64Bytes',
            'ModifyUsernameForExistingProfile'
        ];
        parser.parse(data, result);
        expect(result).to.have.property('passed').to.equal(8);
        expect(result).to.have.property('failed').to.equal(2);
        expect(result).to.have.property('failedTests').to.have.lengthOf(2);
        expect(result).to.have.property('failedTests').to.have.deep.members(expectedFailedTests);
        done();
    });

    it('should parse another @passedFailedAndTest@', function (done) {
        var data = "Test 'CreateSocialGraphEmptyUserTable' failed with DbConnectionException." +
            "Reason: Failed to establish socket connection to magnetoDb (127.0.0.1:5121)." +
            "Test 'CreateSocialGraphSparseUserTable' failed with DbConnectionException." +
            "Reason: Failed to establish socket connection to magnetoDb (127.0.0.1:5121)." +
            "Test 'CreateSocialGraphFullUserTable' failed with DbConnectionException." +
            "Reason: Failed to establish socket connection to magnetoDb (127.0.0.1:5121)." +
            "Test 'RecalcSocialGraphEmptyUserTable' failed with DbConnectionException." +
            "Reason: Failed to establish socket connection to magnetoDb (127.0.0.1:5121)." +
            "Test 'RecalcSocialGraphSparseUserTable' failed with DbConnectionException." +
            "Reason: Failed to establish socket connection to magnetoDb (127.0.0.1:5121)." +
            "Test 'RecalcSocialGraphFullUserTable' failed with DbConnectionException." +
            "Reason: Failed to establish socket connection to magnetoDb (127.0.0.1:5121)." +
            "Passed: 0 Failed: 6";
        var expectedFailedTests = ['CreateSocialGraphEmptyUserTable',
            'CreateSocialGraphSparseUserTable',
            'CreateSocialGraphFullUserTable',
            'RecalcSocialGraphEmptyUserTable',
            'RecalcSocialGraphSparseUserTable',
            'RecalcSocialGraphFullUserTable'];
        var result = {};
        parser.parse(data, result);
        expect(result).to.have.property('passed').to.equal(0);
        expect(result).to.have.property('failed').to.equal(6);
        expect(result).to.have.property('failedTests').to.have.lengthOf(6);
        expect(result).to.have.property('failedTests').to.have.deep.members(expectedFailedTests);
        done();
    });
    it('should parse with @TestwordRepeated@', function (done) {
        var data = " Test 'InitializeWithEmptyUserTable' failed with TimeoutException." +
            "Reason: Test ran longer than 60000ms." +
            "stdout: Passed: 9 Failed: 1";

        var expectedFailedTests = ['InitializeWithEmptyUserTable'];
        var result = {};
        parser.parse(data, result);
        expect(result).to.have.property('passed').to.equal(9);
        expect(result).to.have.property('failed').to.equal(1);
        expect(result).to.have.property('failedTests').to.have.lengthOf(1);
        expect(result).to.have.property('failedTests').to.have.deep.members(expectedFailedTests);
        done();
    });
    it('should pass with case insensitive @Testword@', function(done) {
        var data = " Unable to initialize test 'ReindexGraphTable':" +
            "TypeError: Assignment to constant variable." +
            "at Timeout.fn [as _onTimeout] (/nilesh-workspace/taskrunner-exercise/simpletestrunner.js:81:23)" +
            "at ontimeout (timers.js:386:11)" +
            "at tryOnTimeout (timers.js:250:5)" +
            "at Timer.listOnTimeout (timers.js:214:5)";
        var expectedFailedTests = ['ReindexGraphTable'];
        var result = {};
        parser.parse(data, result);
        expect(result).to.have.property('passed').to.equal(0); //count of failed is increased in stderr
        expect(result).to.have.property('failedTests').to.have.lengthOf(1);
        expect(result).to.have.property('failedTests').to.have.deep.members(expectedFailedTests);
        done();

    })

});