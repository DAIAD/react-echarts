'use strict';

var React =  global.React || require('react');
var _ = global.lodash || require('lodash');

var PropTypes = React.PropTypes;

// A collection of validators for React properties (propTypes)

var validateDimension = function (props, propName, componentName) {
  var val = props[propName];
  if (_.isNumber(val)) {
    return;
  } else if (!/^[0-9]+.?([0-9]+)?(px|em|ex|%|vx|vw)$/.test(val.toString())) {
    return new Error(
      'Invalid property `' + propName + '` supplied to' + ' `' + componentName + '`:' +
      'Not a CSS dimension (width/height): ' + val
    );
  }
};

module.exports = {validateDimension};
