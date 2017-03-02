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

// ##### then(function)
// Construct a new node whose value is the result of applying `f` to the value of this node.
// ```
// let x = dataflow(2).then((x) => x*x*x);
// x.value(); // 8
// ```
DataflowNode.prototype.then = function(f) {
  return new DataflowNode(new DependentNode(f, [this._node]));
};


// -----------------------------
// Export the DataflowNode class
module.exports = DataflowNode;
