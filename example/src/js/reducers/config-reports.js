
var ActionTypes = require('../action-types');

var initialState = {
  
  // The  level of detail
  levels: {
    'day': {bucket: 'day', duration: [1, 'd']},
    'week': {bucket: 'isoweek', duration: [1, 'w']},
    'month': {bucket: 'month', duration: [1, 'M']},
    'year': {bucket: 'year', duration: [1, 'Y']},
  },
  
  // Describe types of reports
  byType: { 
    
    // Measurements //
    
    measurements: {
      title: 'Measurements',
      computeKey: (field, level, reportName) => ([field, level, reportName].join('/')),
      
      // The data sources for our measurements
      sources: {
        'meter': {name: 'meter', title: 'Meter'},
        'device': {name: 'device', title: 'Device'},
      },

      // Metrics provided
      metrics: ['SUM', 'COUNT', 'AVERAGE', 'MIN', 'MAX'],
      
      // What physical quantities are being measured
      fields: {
        'volume': {
          name: 'volume',
          title: 'Water Consumption',
          unit: 'm\u00B3', // m^3
          sources: ['meter', 'device'],
        },
        'energy': {
          name: 'energy',
          title: 'Energy Consumption',
          unit: 'kWh',
          sources: ['device'],
        },
      },
      
      // Report on different levels of detail 
      levels: { 
        'week': {
          name: 'week',
          title: 'Week',
          description: 'Report over week', // time unit of 1 week
          reports: {
            'avg-daily-avg': {
              title: 'Average of daily consumption',
              description: 'The weekly average of the average daily consumption',
              queryParams: {
                time: {
                  granularity: 'DAY'
                },
                population: {
                },
              },
              timespan: 'quarter', // default
              metrics: ['AVERAGE'],
              consolidate: 'AVERAGE',
            },
            'avg-daily-peak': {
              title: 'Peak of daily consumption',
              description: 'The weekly average of the daily min/max consumption',
              queryParams: {
                time: {
                  granularity: 'DAY'
                },
                population: {
                },
              },
              timespan: 'quarter', // default
              metrics: ['MIN', 'MAX'],
              consolidate: 'AVERAGE',
            },
            'top-3': {
              title: 'Top 3 consumers',
              description: 'The weekly 3 top/bottom consumers',
              queryParams: {
                time: {
                  granularity: 'WEEK'
                },
                population: {
                  // Rank members for each population group
                  ranking: [
                    {
                      type: 'TOP',
                      metric: 'SUM',
                      limit: 2,
                    },
                    {
                      type: 'BOTTOM',
                      metric: 'SUM',
                      limit: 2,
                    },
                  ],
                },
              },
              timespan: 'quarter', // default
              metrics: null, // n/a
              consolidate: 'AVERAGE', // n/a
            }
          },
        },
        'month': {
          name: 'month',
          title: 'Month',
          description: 'Report over month', // time unit of 1 month
          reports: {
            /* nothing yet */
          },
        },
      },
    },

    // System Utilization //
    
    system: {
      title: 'System Utilization',
      computeKey: (level, reportName) => ([level, reportName].join('/')),
      
      levels: {
        'week': {
          name: 'week',
          title: 'Week',
          description: 'Report over week', // time unit of 1 week
          reports: {
            'data-transmission': {
              title: 'Data Transmission',
              // Todo
            },
          },
        },
      },
    },
  
  },
};

var reduce = function (state, action) {
  
  // This part (configuration for reports) does not ever change
  return initialState;

};

module.exports = reduce;
