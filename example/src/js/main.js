const develop = !(process.env.NODE_ENV === 'production');

var {renderRoot} = require('./index');
var store = require('./store');
var actions = require('./actions/index');

var rootSelector = document.currentScript.getAttribute('data-root') || '#root';

document.addEventListener("DOMContentLoaded", function () {
  var rootEl = document.querySelector(rootSelector);
  store.dispatch(actions.config.configure()).then(
    res => (
      console.info('Loaded configuration; Rendering root...'),
      renderRoot(rootEl)
    ),
    reason => (
      console.error('Failed to load configuration!'),
      null
    )
  );
});

develop && (global.$a = {
  store: store,
  query: require('./query'),
  actions: require('./actions/index')
});
