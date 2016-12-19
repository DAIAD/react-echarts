var _ = require('lodash');

var whiteboardTheme = require('./whiteboard');

// Clone an existing theme and tweak settings

var theme = _.cloneDeep(whiteboardTheme);

var nameTextStyle = {
  fontSize: 16,
  color: '#333', 
};

var labelTextStyle = {
  fontSize: 13,
  color: '#555', 
};

theme.categoryAxis.nameTextStyle = nameTextStyle;
theme.categoryAxis.axisLabel.textStyle = labelTextStyle;

theme.valueAxis.nameTextStyle = nameTextStyle;
theme.valueAxis.axisLabel.textStyle = labelTextStyle;

module.exports = theme;
