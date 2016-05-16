'use strict';

var ActionTypes = require('../action-types');

var actions = {

  // Plain actions 

  setConfiguration: () => ({
    type: ActionTypes.config.reports.SET_CONFIGURATION,
  }),

  // Thunk actions

  configure: () => (dispatch, getState) => {
    // No async parts for reports configuration
    dispatch(actions.setConfiguration());
    return Promise.resolve(199);
  },
};

module.exports = actions;
