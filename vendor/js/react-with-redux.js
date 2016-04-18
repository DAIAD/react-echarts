// React

var React = require('react');
var ReactDOM = require('react-dom');

React.addons || (React.addons = {});
React.addons.PureRenderMixin = require('react-addons-pure-render-mixin');

global.React = React;
global.ReactDOM = ReactDOM;

// Redux

var Redux = require('redux');
var ReactRedux = require('react-redux');
var ReduxThunk = require('redux-thunk');
var reduxLogger = require('redux-logger');

global.Redux = Redux;
global.ReactRedux = ReactRedux;
global.ReduxThunk = ReduxThunk;
global.reduxLogger = reduxLogger;
