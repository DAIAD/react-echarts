var React = global.React || require('react');
var ReactDOM = global.ReactDOM || require('react-dom');
var ReactRedux = global.ReactRedux || require('react-redux');

var Root = require('./components/root');
var actions = require('./actions');
var store = require('./store');

var Provider = ReactRedux.Provider;

var renderRoot = function (placeholder) 
{
  var root = (
    <Provider store={store}>
      <Root />
    </Provider>
  );
  ReactDOM.render(root, placeholder);
};

module.exports = {Root, renderRoot, store, actions}
