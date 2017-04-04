'use strict';
// # Main Function
// This module defines the `dataflow` function, which wraps its input in a dataflow node.
const InputNode = require('./InputNode');
const DependentNode = require('./DependentNode');
const DataflowNode = require('./DataflowNode');

function dataflow(value) {
  return new DataflowNode(new InputNode(value));
}
dataflow.DataflowNode = DataflowNode;
dataflow.InputNode = InputNode;
dataflow.DependentNode = DependentNode;

module.exports = dataflow;
