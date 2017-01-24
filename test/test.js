var assert = require('assert');
var simple = require('simple-mock');
var _      = require('lodash');
var orca   = require('../dist/orca.js');

// Prepare Callbacks


describe('Orca', function() {
  var app, callbacks, callbackOne, callbackTwo;

  beforeEach(function() {
    app         = orca.default; // reset instance on each test

    callbacks   = [];
    callbackOne = simple.spy(function() {});
    callbackTwo = simple.spy(function() {});
  });

  describe('#registerAction', function() {
    it('should register actions', function() {
      app.registerGlobalAction(callbackOne);
      callbacks = app._callbacks[app._globalKey][app._entryKey];
      assert.ok(_.includes(_.flattenDeep(callbacks), callbackOne));
    });

    it('should register actions with priority', function() {
      app.registerGlobalAction(callbackOne, 99);
      app.registerGlobalAction(callbackTwo, 100);

      callbacks = _.flattenDeep(app._callbacks[app._globalKey][app._entryKey][99]);

      assert.ok(_.includes(callbacks, callbackOne));
      assert.equal(false, _.includes(callbacks, callbackTwo));
    });
  });

  describe('#run', function() {
    it('should run all callbacks in the global scope', function() {
      app.registerGlobalAction(callbackOne);
      app.run();

      assert.equal(1, callbackOne.callCount);
    });

    it('should only run callbacks in namespace', function() {
      app.registerAction('foo', callbackOne);
      app.registerAction('bar', callbackTwo);

      app.run('foo');

      assert.equal(1, callbackOne.callCount);
      assert.equal(0, callbackTwo.callCount);
    });

    it('should run all nested callbacks in namespace', function() {
      app.registerAction('foo', callbackOne);
      app.registerAction('foo.baz', callbackTwo);

      app.run('foo');

      assert.equal(1, callbackOne.callCount);
      assert.equal(1, callbackTwo.callCount);
    });

    it('should always run global callbacks', function() {
      app.registerGlobalAction(callbackOne);
      app.registerAction('foo', callbackTwo);

      app.run('foo');

      assert.equal(1, callbackOne.callCount);
      assert.equal(1, callbackTwo.callCount);
    });

    it('should call higher priority callbacks first', function() {
      app.registerGlobalAction(callbackOne, 10);
      app.registerGlobalAction(callbackTwo, 20);

      app.run();

      assert.ok(callbackOne.lastCall.k > callbackTwo.lastCall.k);
    });
  });
});
