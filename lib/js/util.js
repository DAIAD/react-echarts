"use strict";

// Several utility functions that dont fit anywhere //

// Generate a random string mapped from a random integer in range 0 .. 10^dd
var randomString = function randomString() {
  var dd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 9;
  return parseInt(Math.random() * Math.pow(10, dd)).toString(36);
};

// An array reducer that inserts a given delimiting symbol every step items
var delimiter = function delimiter(step, delim) {
  return function (res, val, i) {
    return i > 0 && i % step == 0 && res.push(delim), res.push(val), res;
  };
};

// An array reducer that flattens input, possibly inserting a delimiting symbol
var flattener = function flattener(delim) {
  return function (res, val, i) {
    return delim != null && i > 0 && res.push(delim), res.push.apply(res, _.isArray(val) ? val : [val]), res;
  };
};

module.exports = { randomString: randomString, delimiter: delimiter, flattener: flattener };