// React + utilities

var React = require('react');
var ReactDOM = require('react-dom');

React.addons || (React.addons = {});
React.addons.PureRenderMixin = require('react-addons-pure-render-mixin');

var ReactRouter = require('react-router');

var ReactBootstrap = require('react-bootstrap');

global.React = React;
global.ReactDOM = ReactDOM;
global.ReactRouter = ReactRouter;
global.ReactBootstrap = ReactBootstrap;

// Redux

var Redux = require('redux');
var ReactRedux = require('react-redux');
var ReduxThunk = require('redux-thunk');
var reduxLogger = require('redux-logger');

global.Redux = Redux;
global.ReactRedux = ReactRedux;
global.ReduxThunk = ReduxThunk;
global.reduxLogger = reduxLogger;
