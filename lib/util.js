// # Utility Methods
// A simple wrapper module for code snippets used throughout the project.

function isNode(node) {
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

module.exports = {
  'isNode': isNode,
  'failNotANode': failNotANode,
  'failOnUndefinedValue': failOnUndefinedValue
};
