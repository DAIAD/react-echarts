var _ = require('lodash');

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
  
  var resize = () => {
    store.dispatch(actions.resize());
  };
  window.addEventListener('resize', _.debounce(resize, 300, {maxWait: 1000}));

  ReactDOM.render(root, placeholder);
};

module.exports = {Root, renderRoot, store, actions}
