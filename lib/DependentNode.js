'use strict';
// # DependentNode Class
// A dataflow node that is NOT an input to the graph.
// Most of the logic for propagating data from node to node lives here.
const _ = require('underscore');
const util = require('./util');

function DependentNode(f, inputs, isEager) {
  if (!_.isFunction(f)) throw new TypeError("Expected a function.");

  const _f = f;
  const _inputs = [];
  let _outputs = [];
  let _isEager = !!isEager;
  let _isDirty = true;
  let _value;

  if (_.isArray(inputs)) { // TODO write custom isArray
    for (const input of inputs) {
      if (util.isNode(input)) {
        _inputs.push(input);
        input._addOutput(this);
      }
      else {
        const newInput = new InputNode(input); // will fail on input === undefined
        _inputs.push(newInput);
        newInput._addOutput(this);
      }
    }
  } else if (util.isNode(inputs)) {
    _inputs.push(inputs);
    inputs._addOutput(this);
  } else {
    const newInput = new InputNode(inputs); // will fail on inputs === undefined
    _inputs.push(newInput);
    newInput._addOutput(this);
  }

  function _update() {
    _isDirty = false;

    const inputValues = [];
    for (const node of _inputs) {
      // TODO special handling of nulls? or of null-generated errors?
      const value = node.value();
      if (value === undefined) util.failOnUndefinedValue();
      inputValues.push(value);
    }

    // WARNING! Using call() sets this, so if the function depends on a particular
    // this value, unexpected things can happen.
    const result = _f.apply(_f, inputValues);
    if (result === undefined) {
      _value = undefined;
      util.failOnUndefinedValue();
    }
    _value = result;
  }

  this.update = function() {
    _isDirty = true;
    if (_isEager) {
      _update();
    }
    for (const output of _outputs) {
      output.update();
    }
    return this;
  };

  this.value = function() {
    if (_isDirty) {
      _update();
    }
    return _value;
  };

  this.lazy = function() {
    _isEager = false;
    return this;
  };
  this.eager = function() {
    _isEager = true;
    _update();
    return this;
  };
  if (isEager) {
    this.eager();
  }

  this._addOutput = function (newOutput) {
    if (!util.isNode(newOutput)) util.failNotANode();
    _outputs.push(newOutput);
    return this;
  };

  this._removeOutput = function (output) {
    _outputs = _(_outputs).without(output);
    return this;
  };

  // TODO destroy() method, which uses _removeOutput of inputs
}

module.exports = DependentNode;
