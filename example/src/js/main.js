var _index = require('./index');

var rootSelector = document.currentScript.getAttribute('data-root') || '#root';

document.addEventListener("DOMContentLoaded", function () {
  var rootEl = document.querySelector(rootSelector);
  var renderRoot = _index.renderRoot.bind(window, rootEl);
  renderRoot();
});

window.addEventListener('hashchange', function () {
  var store = _index.store, actions = _index.actions;
  store.dispatch(actions.updateRoute());
});
