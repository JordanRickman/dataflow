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
const errors = require('./errors');

// ## Constructor
// Wrap an instance of InputNode or DependentNode via the decorator pattern.
function DataflowNode(node) {
  if (!util.isNode(node)) throw new errors.NotANodeError();

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
DataflowNode.prototype.update = function() {
  return this._node.update.apply(this, arguments);
};

// ##### lazy()
// Puts a node into "lazy" mode, where its value is recomputed when retrieved by `value()`.
// Lazy mode is the default.
DataflowNode.prototype.lazy = function() {
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
DataflowNode.prototype._removeOutput = function() {
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
  throw new errors.NotImplementedError('DataflowNode#destroy');
};


// ## Constructing Methods
// These methods return a new node whose value depends on the value of this node. They do not modify this node. They rely on proper implementations of the abstract methods.

// _A note on terminology:_ "Computation time" refers to the point at which the value of a dataflow node is computed.
// For "lazy" nodes, which is the default, this occurs on the first call to `value()` since input nodes changed.
// (Keep in mind that values must flow through the data graph, so `value()` is also called when a dependent node calls `value()`.)
// For "eager" nodes, this occurs at construction time - or more precisely, when the node is first made eager.
// For "eager" nodes, it will also occur on any `update()`s of an input node (or one of its input nodes, and so on recursively.)

// ##### then(function)
// Construct a new node whose value is the result of applying `f` to the value of this node.
// ```
// let y = dataflow(2).then((x) => x*x*x);
// y.value(); // 8
// ```
DataflowNode.prototype.then = function(f) {
  return new DataflowNode(new DependentNode(f, [this._node]));
};

// ### Collection Methods
// These methods operate on nodes with a collection-typed value.
// Usually, that would be an array, but strings and plain objects are also supported -
// with the exception of functions, despite being considered "objects" by JavaScript
// and having iterable properties. This is due to a limitation of [Underscore](http://underscorejs.org),
// the library Dataflow uses under-the-hood for operating on collections.
//
// If the value of a node is not a collection, an error will occur at computation time.
//
// For arrays, the elements of the collection are exactly the elements of the array.
// For strings, the elements of the collection are the characters of the string (as strings of length 1).
// For objects, the elements of the collection are its _own (not inherited) iterable properties_.
// At each iteration, the user-supplied function may be passed the following arguments:
//
// * `value` - For arrays, the current element. For strings, the current character. For objects, the value of the current key-value pair (the property value).
// * `key` - For arrays and strings, the current index. For objects, the key of the current key-value pair (the property name).
// * `collection` - The collection itself. It's use is _strongly discouraged_, in favor of pure functions on each element, but it is passed by Underscore, so I document it here.

// ##### map(iteratee)
// Provides a functional-programming map() method that transforms each element of a collection using the given function.
// `iteratee` will be passed three arguments: `value`, `key`, and `collection`.
// No matter the input type, always returns an array.
//
// ```
// let y = dataflow([4, 6, 8]).map((x) => 2**x);
// y.value(); // [16, 64, 256]
// let s = dataflow("hello").map((c) => c.toUpperCase());
// s.value(); // ['H', 'E', 'L', 'L', 'O']
// ```
DataflowNode.prototype.map = function(iteratee) {
  return this.then(function(inputList) {
    // Underscore will simply return an empty list if given something other than these types.
    // I find that too forgiving - fail fast and loud.
    if (!_.isArray(inputList) && !_.isString(inputList) && !(_.isObject(inputList) && !_.isFunction(inputList))) {
      throw new TypeError('Can only map(...) an array, string, or non-function object..');
    }

    return _.map(inputList, iteratee);
  });
}

// ##### filter(predicate)
// Provides a functional-programming filter() method that removes all elements of a collection for which the given function is falsy.
// `predicate` will be passed three arguments: `value`, `key`, and `collection`.
// No matter the input type, always returns an array.
//
// ```
// let y = dataflow([1, 2, 3, 4, 5]).filter((x) => x % 2 === 0);
// y.value(); // [2, 4]
// ```
DataflowNode.prototype.filter = function(predicate) {
  return this.then(function(inputList) {
    // Underscore will simply return an empty list if given something other than these types.
    // I find that too forgiving - fail fast and loud.
    if (!_.isArray(inputList) && !_.isString(inputList) && !(_.isObject(inputList) && !_.isFunction(inputList))) {
      throw new TypeError('Can only filter(...) an array, string, or non-function object..');
    }

    return _.filter(inputList, predicate);
  });
}

// ##### reduce(iteratee, [memo])
// Provides a functional-programming reduce() method that reduces a collection to a single value.
// `iteratee` will be passed four arguments: `memo`, `value`, `key`, and `collection`.
//
// `memo` is the value of the reduce operation so far. It can be initialized by passing an
// initial value as the second argument to `.reduce()`. If not passed, it will be initialized
// to the first element of the collection. This means (1) that the reduce operation will start
// with the second element, so the first `key` will never be passed to `iteratee`, and
// (2) that for a collection of length 1, `iteratee` will never be called, and the first
// element returned as-is.
//
// ```
// let z = dataflow([1, 2, 3, 4]).reduce((x, y) => x + y);
// z.value(); // 10 (1+2+3+4)
// let concatKV = dataflow({ key1: 'val1', key2: 'val2'})
//     .reduce((memo, val, key) => memo + ',' + key + ':' + val, "");
// concatKV.value(); // ",key1:val1,key2:val2"
// ```
DataflowNode.prototype.reduce = function(iteratee, memoInitial) {
  return this.then(function(inputList) {
    // Underscore will simply return an empty list if given something other than these types.
    // I find that too forgiving - fail fast and loud.
    if (!_.isArray(inputList) && !_.isString(inputList) && !(_.isObject(inputList) && !_.isFunction(inputList))) {
      throw new TypeError('Can only reduce(...) an array, string, or non-function object..');
    }

    return memoInitial === undefined ? _.reduce(inputList, iteratee) : _.reduce(inputList, iteratee, memoInitial);
  });
}

// -----------------------------
// Export the DataflowNode class
module.exports = DataflowNode;
