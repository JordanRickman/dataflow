'use strict';
// # The InputNode Class
// A dataflow node representing an input to the dataflow graph.
// InputNodes wrap a regular JavaScript value, and their value is not dependent on any other node.
const util = require('./util');
const errors = require('./errors');

function InputNode(initialValue) {
  if (initialValue === undefined) throw new errors.UndefinedNodeError();

  let _value = initialValue;
  let _outputs = [];

  this.value = function() {
    return _value;
  };

  this.update = function (newValue) {
    if (newValue === undefined) throw new errors.UndefinedNodeError();

    // null will cascade through code below
    _value = newValue;
    for (const output of _outputs) {
      output.update();
    }
    return this;
  };

  this._addOutput = function (newOutput) {
    if (!util.isNode(newOutput)) throw new errors.NotANodeError();
    _outputs.push(newOutput);
    return this;
  };

  this._removeOutput = function (output) {
    _outputs = _(_outputs).without(output);
    return this;
  };

  // eager vs lazy doesn't apply to InputNodes, but must support eager() method for API consistency
  this.eager = function() { return this; };
  this.lazy = this.eager;
}

module.exports = InputNode;
