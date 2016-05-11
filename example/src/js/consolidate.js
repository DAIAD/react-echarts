'use strict';

var _ = require('lodash');

module.exports = {

  'AVERAGE': (a) => (
    a.length? ((a.length > 1)? (_.sum(a)/a.length) : (a[0])) : null
  ),
  
  'MIN': (a) => (_.min(a)),
  
  'MAX': (a) => (_.max(a)),
};
