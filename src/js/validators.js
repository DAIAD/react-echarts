
var React =  require('react');
var _ = require('lodash');

var PropTypes = React.PropTypes;

// A collection of validators for React properties (propTypes)

var validateDimension = function (props, propName, componentName) {
  var val = props[propName];
  
  if (val == null) {
    return; // do not validate; nulls are allowed
  }
  
  if (_.isNumber(val)) {
    return;
  } else if (!/^[0-9]+.?([0-9]+)?(px|em|ex|%|vh|vw)$/.test(val.toString())) {
    return new Error(
      'Invalid property `' + propName + '` supplied to' + ' `' + componentName + '`:' +
      'Not a CSS dimension (width/height): ' + val
    );
  }
};

module.exports = {validateDimension};
