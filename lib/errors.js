'use strict'
// # Custom Error Types - UNUNED
// _**TODO** This is currently unused - I can't get a good custom error type
//   setup that plays nice with Chai. Maybe use ES6 classes, but I'm not sure
//   I want to switch the whole project to ES6.
//
// All of these classes will be available under the `dataflow.errors` property.
// So, you can use that to check the type of errors thrown by dataflow code.


// ##### UndefinedNodeError
// Dataflow needs to know if a node's value has not yet been computed, and it
// uses `undefined` for this purpose. Therefore, nodes are not allowed to have
// a value of `undefined`. While this does impose a limit on their usage, we
// think it is a sensible one - more often than not, setting a value as
// undefined or returning undefined from a function is probably a bug.
// You should use `null` when you need to signal a missing value.
class UndefinedNodeError extends TypeError {
  constructor(...args) {
    super(...args);
    if (Error.hasOwnProperty('captureStackTrace'))
      Error.captureStackTrace(this, this.constructor);
    this.name = 'UndefinedNodeError';
    this.message = "A Node cannot have undefined as a value.";
  }
}

// ##### NotANodeError
// Thrown when a dataflow node was expected, but a different type was given.
class NotANodeError extends TypeError {
  constructor(...args) {
    super(...args);
    if (Error.hasOwnProperty('captureStackTrace'))
      Error.captureStackTrace(this, this.constructor);
    this.name = 'NotANodeError';
    this.message = "A dataflow node can only be wired to another dataflow node.";
  }
}

// ##### NotImplementedError
// Thrown when a method is not yet implemented.
class NotImplementedError extends Error {
  constructor(methodname, ...args) {
    super(...args);
    if (Error.hasOwnProperty('captureStackTrace'))
      Error.captureStackTrace(this, this.constructor);
    this.name = 'NotImplementedError';
    this.message = `Method not yet implemented: ${methodname}`;
  }
}

// TODO Capture information about the node that generated the error? Use superclass`

module.exports = {
  UndefinedNodeError: UndefinedNodeError,
  NotANodeError: NotANodeError
};
