'use strict';
// # Utility Methods
// A simple wrapper module for code snippets used throughout the project.

function isNode(node) {
  // TODO Check if the argument is a Node
  return true;
}

// Nulls propagate through the data graph, but we reject undefineds because
//  they are more than likely the result of a bug.
function failUnimplemented() {
  throw new Error("Method not implemented.");
}

module.exports = {
  'isNode': isNode
};
