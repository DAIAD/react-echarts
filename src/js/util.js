'use strict';

// Several utility functions that dont fit anywhere //

// Generate a random string mapped from a random integer in range 0 .. 10^dd
var randomString = (dd=9) => (
  parseInt(Math.random() * Math.pow(10, dd)).toString(36)
);

// An array reducer that inserts a given delimiting symbol every step items
var delimiter = (step, delim) => (res, val, i) => (
  (i > 0 && i % step == 0) && res.push(delim), 
  res.push(val), 
  res
);

// An array reducer that flattens input, possibly inserting a delimiting symbol
var flattener = (delim) => (res, val) => (
  res.push.apply(res, _.isArray(val)? val : [val]),
  delim && res.push(delim),
  res
);

module.exports = {randomString, delimiter, flattener}
