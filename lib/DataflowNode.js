'use strict';
// # DataflowNode Class
// Common methods for all dataflow nodes. This file serves as an API reference.
//
// DataflowNode wraps the InputNode and DependentNode classes via the decorator pattern.
// Those subclasses contain the code for internal data propagation.
// This class provides methods for deriving new nodes, such as `then`, `map`, `filter`, and `reduce`.
const _ = require('underscore');
const util = require('./util');
const DependentNode = require('./DependentNode');

// ## Constructor
// Wrap an instance of InputNode or DependentNode via the decorator pattern.
function DataflowNode(node) {
  if (!util.isNode(node)) failNotANode();

  this._node = node; // TODO Keep private via closure? Would need to move prototype methods in here too, reducing performance.
}

// ## "Abstract" Methods
// These methods are to be implemented in InputNode and DependentNode.
// The DataflowNode methods simply forward the call.

// ### Accessor Methods

// ##### value()
// Returns the current value of a node.
DataflowNode.prototype.value = function() {
  return this._node.value.apply(this, arguments);
};

// ### Mutator Methods
// These methods modify the node object on which they are called.

// ##### update(), update(value)
// Signals to a node that its input data has changed.
// For dependent nodes, their inputs must call `update()` whenever their (the input's) value changes.
// For input nodes, users may change the value by calling `update(value)`.
DataflowNode.prototype.update = function () {
  return this._node.update.apply(this, arguments);
};

// ##### lazy()
// Puts a node into "lazy" mode, where its value is recomputed when retrieved by `value()`.
// Lazy mode is the default.
DataflowNode.prototype.lazy = function () {
  return this._node.lazy.apply(this, arguments);
};

// ##### eager()
// Puts a node into "eager" mode, where its value is recomputed as soon as data changes (when calling `update()`).
DataflowNode.prototype.eager = function () {
  return this._node.eager.apply(this, arguments);
};

// ##### _addOutput(node)
// Connect a node to a node whose value depends on its value. For data propagation, nodes must know about their dependents.
DataflowNode.prototype._addOutput = function () {
  return this._node._addOutput.apply(this, arguments);
};

// `_addOutput` is a "protected" method - the leading underscore signifies that it should only be called by dataflow code.

// ##### _removeOutput(node)
// Remove a dependent node whose value depends on this node.
// Once removed, the dependent will no longer receive `update()` calls when this node is updated.
DataflowNode.prototype._removeOutput = function () {
  return this._node._removeOutput.apply(this, arguments);
};

// ##### destroy()
// Destroy a node. Implementations must...
// 1. Disconnect the node from all inputs (via `_removeOutput()`).
// 2. Call `destroy()` on all output nodes - thereby recursively destroying all dependents.
// 3. Delete as much internal state as possible, to aid in garbage collection.
// 4. Leave the node in an unusuable state such that all methods will throw an error.

// **TODO** We are implementing this here to throw an Error("Method not implemented.").
// It will later be implemented in InputNode and DependentNode
DataflowNode.prototype.destroy = function() {
  util.failUnimplemented();
};


// ## Constructing Methods
// These methods return a new node whose value depends on the value of this node. They do not modify this node. They rely on proper implementations of the abstract methods.

// _A note on terminology:_ "Computation time" refers to the point at which the value of a dataflow node is computed.
// For "lazy" nodes, which is the default, this occurs on the first call to `value()`` since input nodes changed.
// (Keep in mind that values must flow through the data graph, so `value()` is also called when a dependent node calls `value()`.)
// For "eager" nodes, this occurs at construction time - or more precisely, when the node is first made eager.
// It will also occur on any `update()`s of an input node (or one of its input nodes, and so on recursively.

// ##### then(function)
// Construct a new node whose value is the result of applying `f` to the value of this node.
// ```
// let y = dataflow(2).then((x) => x*x*x);
// y.value(); // 8
// ```
DataflowNode.prototype.then = function(f) {
  return new DataflowNode(new DependentNode(f, [this._node]));
};

// ##### map(iteratee)
// Construct a new node whose value is the result of applying `iteratee` to each element of this node's value.
// ```
// let y = dataflow([4, 6, 8]).map((x) => 2**x);
// y.value(); // [16, 64, 256]
// ```
// The map method is supported on node values of type array, string, or non-function objects.
// All other types will produce a TypeError at computation-time.
//
// For arrays, each array element is mapped.
// For objects, each key-value pair is mapped, with the value as the first argument and the key as the second argument.
// For strings, each character is mapped.
// In all cases, an array is returned.
//
// The iteratee is passed three arguments:
// 1. `element` - the current element being mapped, or the value of the key-value pair in an object.
// 2. `index` - the current index or key
// 3. `list` - the full input list. Its use is **strongly** discouraged - `map` should be used with pure mapping functions. However, as it is passed by the underlying Underscore.js library, I am documenting it here.
DataflowNode.prototype.map = function(iteratee) {
  return this.then(function(inputList) {
    // Underscore will simply return an empty list if given something other than these types.
    // I find that too forgiving - fail fast and loud.
    if (!_.isArray(inputList) && !_.isString(inputList) && !(_.isObject(inputList) && !_.isFunction(inputList))) {
      throw new TypeError('Can only map(...) an array, string, or non-method object..');
    }

    return _.map(inputList, iteratee);
  });
}

// ##### filter(predicate)
// Construct a new node whose value is the result of filtering this node's elements by the given `predicate`.
// Only those elements for which the predicate returns true will be retained.
// ```
// let y = dataflow([1, 2, 3, 4, 5]).filter((x) => x % 2 === 0);
// y.value(); // [2, 4]
// ```
// The filter method is supported on node values of type array, string, or non-function objects.
// All other types will produce a TypeError at computation-time.
//
// For arrays, the array elements are filtered.
// For objects, the values (not the keys!) are filtered.
// For strings, the characters are filtered.
// In all cases, an array is returned.
//
// The predicate is passed three arguments:
// 1. `element` - the current element, or the value of the key-value pair in an object.
// 2. `index` - the current index or key
// 3. `list` - the full input list. Its use is **strongly** discouraged - `filter` should be used with pure predicates. However, as it is passed by the underlying Underscore.js library, I am documenting it here.
DataflowNode.prototype.filter = function(predicate) {
  return this.then(function(inputList) {
    // Underscore will simply return an empty list if given something other than these types.
    // I find that too forgiving - fail fast and loud.
    if (!_.isArray(inputList) && !_.isString(inputList) && !(_.isObject(inputList) && !_.isFunction(inputList))) {
      throw new TypeError('Can only filter(...) an array, string, or non-method object..');
    }

    return _.filter(inputList, predicate);
  });
}

// ##### reduce(iteratee, [memo])
// Construct a new node whose value is the result of reducing this node's value using the given `iteratee`.
// Provides a functional-programming-style reduce method for collections.
// ```
// let z = dataflow([1, 2, 3, 4]).filter((x, y) => x + y);
// z.value(); // 10 (1+2+3+4)
// ```
//
// The filter method is supported on node values of type array, string, or non-function objects.
// All other types will produce a TypeError at computation-time.
//
// The `iteratee` is passed four arguments:
// 1. `memo` - the reduced value so far. If `memo` is passed to `reduce`, it sets the initial value of the memo. If not, the initial value of memo is the first element, and the reduction starts on the second element.
// 2. `element` - the current element, or value in a key-value pair of an object
// 3. `index` - the index or the key in a key-value pair of an object
// 4. `list` - the full input list. Its use is **strongly** discouraged - `reduce` should be used with pure reduction functions. However, as it is passed by the underlying Underscore.js library, I am documenting it here.
DataflowNode.prototype.reduce = function(iteratee, memoInitial) {
  return this.then(function(inputList) {
    // Underscore will simply return an empty list if given something other than these types.
    // I find that too forgiving - fail fast and loud.
    if (!_.isArray(inputList) && !_.isString(inputList) && !(_.isObject(inputList) && !_.isFunction(inputList))) {
      throw new TypeError('Can only filter(...) an array, string, or non-method object..');
    }

    return memoInitial === undefined ? _.reduce(inputList, iteratee) : _.reduce(inputList, iteratee, memoInitial);
  });
}

// -----------------------------
// Export the DataflowNode class
module.exports = DataflowNode;
