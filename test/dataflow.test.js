'use strict';
// # Dataflow Functional Tests
// This is the main test class, providing functional tests for all dataflow features.
const expect = require('chai').expect;
const dataflow = require('../lib');

describe('dataflow', function() {
  it('is a function', function () {
    expect(dataflow).to.be.a('function');
  });

  describe('lone node', function () {
    it('holds a given value of any type', function () {
      let x = dataflow(2);
      expect(x.value()).to.equal(2);

      x = dataflow("hello, world.");
      expect(x.value()).to.equal("hello, world.");

      x = dataflow(false);
      expect(x.value()).to.equal(false);

      x = dataflow(null);
      expect(x.value()).to.equal(null);

      let obj = {};
      x = dataflow(obj);
      expect(x.value()).to.equal(obj);

      let arr = [];
      x = dataflow(arr);
      expect(x.value()).to.equal(arr);

      let regexp = /match me/;
      x = dataflow(regexp);
      expect(x.value()).to.equal(regexp);
    });

    it('cannot hold undefined as its value', function () {
      expect(() => dataflow(undefined)).to.throw(dataflow.errors.UndefinedNodeError, 'cannot have undefined as a value');
      expect(dataflow).to.throw(dataflow.errors.UndefinedNodeError, 'cannot have undefined as a value');

      let x = dataflow(1);
      expect(() => x.update()).to.throw(dataflow.errors.UndefinedNodeError, 'cannot have undefined as a value');
    });

    it('updates its value', function () {
      let x = dataflow(1);
      x.update(-1);
      expect(x.value()).to.equal(-1);

      x.update("I'm a string now!");
      expect(x.value()).to.equal("I'm a string now!");

      x.update(false);
      expect(x.value()).to.equal(false);

      x.update(null);
      expect(x.value()).to.equal(null);

      x.update([]);
      expect(x.value()).to.deep.equal([]);
    });
  });

  describe('flat node chain', function () {
    it('flows data between nodes', function () {
      let x = dataflow(2);
      let y = x.then(k => k+4);
      let z = y.then(k => k*111);
      let w = z.then(k => k+" is the Number of the Beast!");

      expect(w.value()).to.equal("666 is the Number of the Beast!");
    });

    it('flows updates between nodes', function () {
      let x = dataflow(2);
      let y = x.then(k => k+4);
      let z = y.then(k => k*111);
      let w = z.then(k => k+" is the Number of the Beast!");

      x.update(3);

      expect(w.value()).to.equal("777 is the Number of the Beast!");

      // TODO What should happen if you update a dependent node?
    });
  });
  // TODO
})
