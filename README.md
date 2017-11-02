# Task Dispatcher
Dispatcher runs as a RESTful server for scheduling and monitoring a set of tasks 

## Setup
This is a node.js project and tested on node (v6.11.5) and npm (5.4.2). This project is hosted on heroko and already running `tdispatcher.herokuapp.com`. 

If you want to run it locally

```bash
npm install
```

Server can be started with (DEBUG will print verbose logs)
```bash
DEBUG=taskrunner* node index
```


## API documentation

### Start a new run

A POST (/task) with request body `{"action": "run","testSuite": "testSuite4"}`, indicating the action is to `run` the suite `testSuite4` 

```bash
curl -X POST -H "Content-Type: application/json" -d '{"action": "run","testSuite": "testSuite4"}' "https://tdispatcher.herokuapp.com/task"
```

This will output below, indicating the id of the run, suite name and status. At the beginning, `runtime`, `passed`, `failed` and `failedTests` would be default values

```bash
{"id":"87d4bdf0-bfe2-11e7-a1a2-3512b673684b","testSuite":"testSuite4","status":"running","runtime":"0","passed":0,"failed":0,"failedTests":[]}
```

### Get the status of a test run

A GET (/task/status/:id), this api requires the run id

```bash
curl -X GET "https://tdispatcher.herokuapp.com/task/status/40efd3b0-bfe3-11e7-a1a2-3512b673684b"
```

This will output below, indicating the id of the run, suite name and status. Since the suite is still `running`, the `passed`, `failed`, `runtime` and `failedTests` would still be default 

```javascript
{
  "id": "40efd3b0-bfe3-11e7-a1a2-3512b673684b",
  "testSuite": "testSuite4",
  "status": "running",
  "runtime": 30.460770422,
  "passed": 0,
  "failed": 0,
  "failedTests": [
    
  ]
}
```
### Get the status of a completed test run

Similar to above GET (/task/status/:id) can be used to get the status of a completed suite. 

```bash
curl -X GET "https://tdispatcher.herokuapp.com/task/status/c62563b0-bfe3-11e7-a1a2-3512b673684b"
```

Since now the suite is `completed`, the `passed`, `failed`, `runtime` and `failedTests` would be populated with appropriate values

```javascript
   {
     "id": "c62563b0-bfe3-11e7-a1a2-3512b673684b",
     "testSuite": "testSuite3",
     "status": "completed",
     "runtime": 5.147850308,
     "passed": 0,
     "failed": 6,
     "failedTests": [
       "CreateSocialGraphEmptyUserTable",
       "CreateSocialGraphSparseUserTable",
       "CreateSocialGraphFullUserTable",
       "RecalcSocialGraphEmptyUserTable",
       "RecalcSocialGraphSparseUserTable",
       "RecalcSocialGraphFullUserTable"
     ]
   }
```
For any invalid id, or any invalid action (apart from run/cancel), validation error will be returned
    
### Cancel an active test run
A POST (/task) with request body `{"action": "cancel","id": "123"}`, indicating the action is to `cancel` the suite with id `123`. For example

```bash
curl -X POST -H "Content-Type: application/json" -d '{"action": "cancel","id": "aacfa380-bfe5-11e7-a8ba-b5bf1476d6a8"}' "https://tdispatcher.herokuapp.com/task"
```
This will output below. Now the status is `cancelled`, including its `runtime`. Since the suite was `cancelled` before it could complete, the `passed`, `failed`, `runtime` and `failedTests` would still be default 

```javascript
{
  "id": "aacfa380-bfe5-11e7-a8ba-b5bf1476d6a8",
  "testSuite": "testSuite4",
  "status": "cancelled",
  "runtime": 19.088165634,
  "passed": 0,
  "failed": 0,
  "failedTests": []
}
```
If users try to cancel an already cancelled suite, there will be a validation error

## Tests
  Unit tests reside under `test/unit` and can be run by `npm test`
  Functional tests reside under `test/functional` and can be run by `npm run verify`
  Linting can be run by `npm run jshint`  

## Problem statement
For this exercise, you will implement a task dispatcher. The dispatcher will run as a service that allows the scheduling and monitoring of a set of tasks, and retrieval of their results.

The tasks will be “test suites” which will be run from a simple javascript project, `simpletestrunnner.js`, provided in this repository. Your service will be capable of the following:

* starting a new run of one of the included test suites on request, provided the test suite name
* providing the status of a test run on request, including its runtime
* reporting the results of a completed test run on request, including test failures, pass/fail count, and total runtime for the run
* canceling an active test run, on request.

You will be implementing the task management functionality, and providing an API or command interface for users to initiate the above actions. You may create this project using your programming language of choice, and may utilize libraries or frameworks that you deem suitable for the task.

To run the test suite module, you will need node.js (https://nodejs.org/). The latest stable release (6.11.4 LTS) is recommended. Your service should run test suites by invoking the module with one of the supported suite names, for example `node simpletestrunner testsuite1`. This can be achieved by executing a node.js process from within your program. There are eight supported test suites, named `testsuite1` through `testsuite8`. Consider how to handle different use cases, as the suites exhibit a variety of behaviors.

Completing this exercise should take you around 4-6 hours. When you’re finished, provide your completed program, along with instructions on how to run it. You should also provide example usage for each of the supported actions, along with the expected format for each API or CLI call. Hosting your completed service or project online where it can be accessed and run is appreciated, but not required.
