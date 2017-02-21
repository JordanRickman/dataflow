const _ = require('underscore');

function _isNode(node) {
  // TODO Check if the argument is a Node
  return true;
}
function failNotANode() {
  throw new TypeError("Can only wire a Node to another Node.");
}
// Nulls propagate through the data graph, but we reject undefineds because
//  they are more than likely the result of a bug.
function failOnUndefinedValue() {
  throw new TypeError("A Node cannot have undefined as a value. Use null to clear a node and its dependents.");
}

function InputNode(initialValue) {
  if (initialValue === undefined) failOnUndefinedValue();

  let _value = initialValue;
  let _outputs = [];

  this.value = function() {
    return _value;
  };

  this.update = function (newValue) {
    if (newValue === undefined) failOnUndefinedValue();

    // null will cascade through code below
    _value = newValue;
    for (const output of _outputs) {
      output.update();
    }
    return this;
  };

  this._addOutput = function (newOutput) {
    if (!_isNode(newOutput)) failNotANode();
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
      if (_isNode(input)) {
        _inputs.push(input);
        input._addOutput(this);
      }
      else {
        const newInput = new InputNode(input); // will fail on input === undefined
        _inputs.push(newInput);
        newInput._addOutput(this);
      }
    }
  } else if (_isNode(inputs)) {
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
      if (value === undefined) failOnUndefinedValue();
      inputValues.push(value);
    }

    // WARNING! Using call() sets this, so if the function depends on a particular
    // this value, unexpected things can happen.
    const result = _f.apply(_f, inputValues);
    if (result === undefined) {
      _value = undefined;
      failOnUndefinedValue();
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
    if (!_isNode(newOutput)) failNotANode();
    _outputs.push(newOutput);
    return this;
  };

  this._removeOutput = function (output) {
    _outputs = _(_outputs).without(output);
    return this;
  };

  // TODO destroy() method, which uses _removeOutput of inputs
}

module.exports = {
  'InputNode': InputNode,
  'DependentNode': DependentNode
}
