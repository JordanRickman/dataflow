// # DataflowNode Class
// Base class for all nodes in a dataflow graph. This file also serves as an API reference.
//
// Extended by the InputNode and DependentNode subclasses, which contain the code
// for internal data propagation. This class provides methods for deriving
// new nodes, such as `then`, `map`, `filter`, and `reduce`.
const _ = require('underscore');
const util = require('./util');

function DataflowNode() { }

// ## "Abstract" Methods
// These methods are to be overridden in subclasses.

// ### Accessor Methods

// Returns the current value of a node.
DataflowNode.prototype.value = function() {
  util.failUnimplemented();
};

// ### Mutator Methods
// These methods modify the node object on which they are called.

// Signals to a node that its input data has changed.
DataflowNode.prototype.update = function() {
  util.failUnimplemented();
};

// Puts a node into "lazy" mode, where its value is recomputed when retrieved by `value()`.
DataflowNode.prototype.lazy = function() {
  util.failUnimplemented();
};

// Puts a node into "eager" mode, where its value is recomputed as soon as data changes (when calling `update()`).
DataflowNode.prototype.eager = function() {
  util.failUnimplemented();
};

// Connect a node to a node whose value depends on its value. For data propagation, nodes must know about their dependents.
// This is a "private" method - the leading underscore signifies that it should only be called by dataflow code.
DataflowNode.prototype._addOutput = function(node) {
  util.failUnimplemented();
};

// Remove a dependent node whose value depends on this node. Once removed, the dependent will no longer receive `update()` calls when this node is updated.
DataflowNode.prototype._removeOutput = function() {
  util.failUnimplemented();
};

// Destroy a node. Implementations must...
// 1. Disconnect the node from all inputs (via `_removeOutput()`).
// 2. Call `destroy()` on all output nodes - thereby recursively destroying all dependents.
// 3. Delete as much internal state as possible, to aid in garbage collection.
// 4. Leave the node in an unusuable state such that all methods will throw an error.
DataflowNode.prototype.destroy = function() {
  util.failUnimplemented();
};


// -----------------------------
// Export the DataflowNode class
module.exports = DataflowNode;
