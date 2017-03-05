var assert = require('assert');
var simple = require('simple-mock');
var _      = require('lodash');
var orca   = require('../dist/orca.js');

// Run Tests
describe('Orca', function() {
  var app, callbacks, callbackOne, callbackTwo;

  before(function() {
    app = orca.default; // reset instance on each test
  });

  beforeEach(function() {
    app.reset();
    callbacks   = [];
    callbackOne = simple.spy(function() {});
    callbackTwo = simple.spy(function() {});
  });

  describe('#registerAction', function() {
    it('should register actions', function() {
      app.registerGlobalAction(callbackOne);
      callbacks = _.flattenDeep(app._callbacks[app._globalKey][app._entryKey]);
      assert.ok(_.some(callbacks, ['func', callbackOne]));
    });

    it('should register actions with priority', function() {
      app.registerGlobalAction(callbackOne, {priority: 99});
      app.registerGlobalAction(callbackTwo, {priority: 100});

      callbacks = _.flattenDeep(app._callbacks[app._globalKey][app._entryKey][99]);

      assert.ok(_.some(callbacks, ['func', callbackOne]));
      assert.equal(false, _.some(callbacks, ['func', callbackTwo]));
    });

    it('should reset', function() {
      app.registerGlobalAction(callbackOne);
      callbacks = _.flattenDeep(app._callbacks[app._globalKey][app._entryKey]);
      assert.ok(_.some(callbacks, ['func', callbackOne]));

      app.reset();
      assert.ok(_.isEmpty(app._callbacks));
    });
  });

  describe('#run', function() {
    it('should run all callbacks in the global scope', function() {
      app.registerGlobalAction(callbackOne);
      app.run(app._globalKey);

      assert.equal(1, callbackOne.callCount);
    });

    it('should only run globals once when calling global scope', function() {
        app.registerGlobalAction(callbackOne);
        app.run();

        assert.equal(1, callbackOne.callCount);
    });

    it('should not run callbacks in excluded scopes', function() {
      app.registerGlobalAction(callbackOne, {excludes: ['foo']});

      // Runs in global scope
      app.run();
      assert.equal(1, callbackOne.callCount);

      // Does not run in foo scope
      app.run('foo');
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
      app.registerGlobalAction(callbackOne, {priority: 10});
      app.registerGlobalAction(callbackTwo, {priority: 20});

      app.run();

      assert.ok(callbackOne.lastCall.k > callbackTwo.lastCall.k);
    });
  });
});
