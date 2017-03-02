//# Tutorial

// Modules required for testing
const assert = require('assert');

// Using relative path because this code lives in the project; you should instead `require('dataflow')`.
const dataflow = require('./lib');

// Simple happy-path test
const x = dataflow(2);
const y = new dataflow.DependentNode(function (x) { return x*x; }, [x]);
assert(x.value() === 2);
assert(y.value() === 4);

x.update(3);
assert(x.value() === 3);
assert(y.value() === 9);

assert.throws(
  function() {
    x.destroy();
  }, /not implemented/
);
assert.throws(
  function() {
    y.destroy();
  }, /not implemented/
);
