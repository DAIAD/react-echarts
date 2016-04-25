'use strict';

var randomString = (dd=9) => (
  parseInt(Math.random() * Math.pow(10, dd)).toString(36)
);

module.exports = {randomString}
