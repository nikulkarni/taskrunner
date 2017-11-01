'use strict';

const dispatcher = require('../../lib/dispatcher');
const expect = require('chai').expect;

describe('@dispatcherAndParser@ functionality', function () {

    it('should run @testSuite1@', function (done) {
        dispatcher.run('testSuite1');
        setTimeout(function () {
            var total = dispatcher.getAll();
            console.log(total);
            done();
        }, 6000);
    });
    it('should run @testSuite2@', function (done) {
        dispatcher.run('testSuite2');
        setTimeout(function () {
            var total = dispatcher.getAll();
            console.log(total);
            done();
        }, 6000);
    });
});