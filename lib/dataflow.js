// # Main Function
// This module defines the `dataflow` function, which wraps its input in a dataflow node.
const InputNode = require('./InputNode');
const DependentNode = require('./DependentNode');

function dataflow(value) {
  return new InputNode(value);
}
dataflow.InputNode = InputNode;
dataflow.DependentNode = DependentNode;

module.exports = dataflow;
