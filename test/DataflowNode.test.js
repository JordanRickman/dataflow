'use strict';
// # DataflowNode Unit Tests
// Tests for the DataflowNode class.
// In comparison to the functional tests in dataflow.test.js, these tests will
// mock underlying calls, rather than creating and using real InputNodes or DependentNodes.
// They should provide more thorough coverage of all possible calls to a method
// (e.g. bad data types), whereas the functional tests will focus on expected
// usage but provide coverage of multiple methods working together.
const expect = require('chai').expect;
const DataflowNode = require('../lib/DataflowNode');

describe('DataflowNode', function() {
  // TODO
})
