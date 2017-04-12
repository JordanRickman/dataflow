//# Tutorial

// Modules required for testing
const assert = require('assert');

// Using relative path because this code lives in the project; you should instead `require('dataflow')`.
const dataflow = require('./lib');

//## Simple happy-path test
const x = dataflow(2);
const y = x.then(function (x) { return x*x; });
assert(x.value() === 2);
assert(y.value() === 4);

x.update(3);
assert(x.value() === 3);
assert(y.value() === 9);

assert.throws(
  function() {
    x.destroy();
  }, /not implemented/
);
assert.throws(
  function() {
    y.destroy();
  }, /not implemented/
);


//## Test the map() method
const z = dataflow([1, 2, 3]);
const w = z.map((x) => Math.pow(2, x));
//assert(z.value() === [1, 2, 3]); TODO need assertion library with deepEquals
//assert(w.value() === [2, 4, 8]);
console.log(`z: ${z.value()}`);
console.log(`w: ${w.value()}`);

const s = dataflow("hello");
const S = s.map((c, i) => c.toUpperCase() + i);
assert(s.value() === "hello");
console.log(`S: ${S.value()}`);
//assert(S.value() === ["H0","E1","L2","L3","O4"]);

const o = dataflow({ key1: "val1", key2: "val2" });
const O = o.map((v, k) => `${k}: ${v}`);
console.log(`O: ${O.value()}`);
//assert(O.value() === ['key1: val1', 'key2: val2']);


//## Test the filter() method
const nums = dataflow([0, 1, 2, 3, 4]);
const evens = nums.filter((n) => n % 2 == 0);
// TODO need assertion library with deepEquals
assert(evens.value().length === 3);
assert(evens.value()[0] === 0);
assert(evens.value()[1] === 2);
assert(evens.value()[2] === 4);

const vowels = s.filter((c) => ['a','e','i','o','u'].includes(c));
assert(vowels.value().length === 2);
assert(vowels.value()[0] === 'e');
assert(vowels.value()[1] === 'o');

const keysContain2 = o.filter((v, k) => k.includes('2'));
assert(keysContain2.value().length === 1);
assert(keysContain2.value()[0] === 'val2');

console.log("All tests passed.");
