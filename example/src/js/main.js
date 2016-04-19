var {renderRoot} = require('./index');

var rootSelector = document.currentScript.getAttribute('data-root') || '#root';

document.addEventListener("DOMContentLoaded", function () {
  var rootEl = document.querySelector(rootSelector);
  renderRoot(rootEl);
});

// Note: only for debugging purposes
global.$a = {
  apiclient: require('./api-client/action'),
  actions: require('./actions') 
};
