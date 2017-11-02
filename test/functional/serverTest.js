const request = require('supertest');
const app = require('../../server');
const expect = require('chai').expect;

describe('should run @functional@ test against a running server', function () {

    it('should  @runTestSuite1@', function (done) {
        request(app)
            .post('/task')
            .send({action: 'run', testSuite: 'testSuite1'})
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                console.log(res.status);
                console.log(res.body);
                var expectedResult = {
                    testSuite: 'testSuite1',
                    status: 'running',
                    runtime: '0',
                    passed: 0,
                    failed: 0,
                    failedTests: []
                };
                expect(res.body.id).to.not.be.undefined;
                expect(res.body).to.deep.includes(expectedResult);
                expect(res.status).to.equal(200);
                done();
            });
    });

    it('should  @runTestSuite2AndGetItsStatus@', function (done) {
        request(app)
            .post('/task')
            .send({action: 'run', testSuite: 'testSuite2'})
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                expect(res.status).to.equal(200);
                expect(res.body.id).to.not.be.undefined;
                setTimeout(function () {
                    request(app)
                        .get('/task/status/' + res.body.id)
                        .set('Accept', 'application/json')
                        .end(function (err, res) {
                            if (err) {
                                done(err);
                            }
                            expect(res.body.id).to.not.be.undefined;
                            expect(res.body.status).to.equals('running');
                            expect(res.body.runtime).to.be.above(3.0); //since set timeout is 3s
                            expect(res.body.runtime).to.be.below(4.0); //since the test takes 5+s
                            console.log(res.body);
                            done();
                        });
                }, 3000);
            });
    });

    it('should  @runTestSuite3AndCancelIt@', function (done) {
        request(app)
            .post('/task')
            .send({action: 'run', testSuite: 'testSuite3'})
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                expect(res.status).to.equal(200);
                expect(res.body.id).to.not.be.undefined;
                setTimeout(function () {
                    request(app)
                        .post('/task')
                        .send({action: 'cancel', id: res.body.id})
                        .set('Content-Type', 'application/json')
                        .set('Accept', 'application/json')
                        .end(function (err, res) {
                            if (err) {
                                done(err);
                            }
                            expect(res.body.id).to.not.be.undefined;
                            expect(res.body.status).to.equals('cancelled');
                            expect(res.body.passed).to.equals(0);
                            expect(res.body.failed).to.equals(0);
                            expect(res.body.runtime).to.be.above(3.0); //since set timeout is 3s
                            expect(res.body.runtime).to.be.below(4.0); //since the test takes 5+s
                            expect(res.body.failedTests).to.have.deep.members([]);
                            console.log(res.body);
                            done();
                        });
                }, 3000);
            });
    });

    it('should  @runTestSuite7AndGetItsCompletedSetup@', function (done) {
        request(app)
            .post('/task')
            .send({action: 'run', testSuite: 'testSuite8'})
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                expect(res.status).to.equal(200);
                expect(res.body.id).to.not.be.undefined;
                setTimeout(function () {
                    request(app)
                        .get('/task/status/' + res.body.id)
                        .set('Accept', 'application/json')
                        .end(function (err, res) {
                            if (err) {
                                done(err);
                            }
                            expect(res.body.id).to.not.be.undefined;
                            expect(res.body.status).to.equals('completed');
                            expect(res.body.runtime).to.be.above(3.0); //since the test takes 3+s
                            expect(res.body.runtime).to.be.below(4.0); //actual run should be below 3s
                            console.log(res.body);
                            done();
                        });
                }, 4000);
            });
    });

    it('should get a 400 bad request for @invalidTestRunId@', function (done) {
        request(app)
            .get('/task/status/123')
            .expect(400)
            .end(function (err, res) {
                console.log(res.status);
                console.log(res.body);
                expect(res.status).to.equal(400);
                expect(res.body).to.deep.equals({error: 'Run id 123 was not found'});
                done();
            });
    });

    it('should get a 400 bad request for @invalidAction@', function (done) {
        request(app)
            .post('/task')
            .send({action: 'foo', id: '1212'})
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                expect(res.status).to.equal(400);
                expect(res.body).to.deep.equals({error: 'Validation Error, please check the input'});
                done();
            });
    });

    it('should get a 400 bad request for @noAction@', function (done) {
        request(app)
            .post('/task')
            .send({id: '1212'})
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                expect(res.status).to.equal(400);
                expect(res.body).to.deep.equals({error: 'Validation Error, please provide an action from {run, cancel}'});
                done();
            });
    });

    it('should get a 400 bad request for @runActionNoSuite@', function (done) {
        request(app)
            .post('/task')
            .send({action: 'run', id: '1212'})
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                expect(res.status).to.equal(400);
                console.log(res.body);
                expect(res.body).to.deep.equals({error: 'Validation Error, expect testSuite in request body'});
                done();
            });
    });

    it('should get a 400 bad request for @cancelActionNoId@', function (done) {
        request(app)
            .post('/task')
            .send({action: 'cancel', foo: '1212'})
            .set('Content-Type', 'application/json')
            .set('Accept', 'application/json')
            .end(function (err, res) {
                if (err) {
                    done(err);
                }
                expect(res.status).to.equal(400);
                console.log(res.body);
                expect(res.body).to.deep.equals({error: 'Validation Error, expect run id in request body'});
                done();
            });
    });
});