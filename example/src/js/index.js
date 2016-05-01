var React = require('react');
var ReactDOM = require('react-dom');
var ReactRedux = require('react-redux');

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
