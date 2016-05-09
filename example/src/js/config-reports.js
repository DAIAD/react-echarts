var _ = require('lodash');

var population = require('./population');

module.exports = {
  
  utility: {
    name: 'Daiad', 
    id: '80de55eb-9bde-4477-a97a-b6048a1fcc9a',
  },
 
  population: {
    
    types: {
      // The whole population
      'UTILITY': population.Utility,
      // A group (usually belongs to a named cluster)
      'GROUP': population.Group,
    },
    
    // Todo Configure each grouping and define groups (i.e clusters)
    // Todo Discover the followings groups at initialization time
    clusters: {
      'Household Size': {
        '1': {
          name: '1',
          title: 'single',
          id: '1234',
        },
        '2': {
          name: '2',
          title: '2 members',
          id: '1234',
        },
        '3': {
          name: '3',
          title: '3 members',
          id: '1234',
        },
        '4-plus': {
          name: '4+',
          title: 'More than 3 members',
          id: '1234',
        },
      },
      'Income': {
        /* Todo */
      },
      'Age': {
        /* Todo */
      },
    },

    labels: {
      // Generate labels for population groups
      'UTILITY': {
      },

      'CLUSTER': {
        // Todo
        generate: null,
        parse: null,
      }
    }
  },
  
  consolidateFn: {
    'AVERAGE': (a) => (a.length? (_.sum(a)/a.length) : null),
    'MIN': (a) => (_.min(a)),
    'MAX': (a) => (_.max(a)),
  },

  levels: {
    'day': {
      bucket: 'day',
      duration: [1, 'd']
    },
    'week': {
      bucket: 'isoweek',
      duration: [1, 'w'],
    },
    'month': {
      bucket: 'month',
      duration: [1, 'M'],
    },
  },

  reports: {
    measurements: {
      info: {
        title: 'Measurements',
      },
      computeKey: (field, level, reportName) => (
        [field, level, reportName].join('/')
      ),
      // What physical quantities are being measured
      fields: {
        'volume': {
          name: 'volume',
          title: 'Water Consumption',
          unit: 'm\u00B3', // m^3
          sources: ['METER', 'DEVICE'],
        },
        'energy': {
          name: 'energy',
          title: 'Energy Consumption',
          unit: 'kWh',
          sources: ['DEVICE'],
        },
      },
      // Report on different levels of detail 
      levels: { 
        'week': {
          info: {
            name: 'week',
            title: 'Week',
            description: 'Report over week', // time unit of 1 week
          },
          // Configure available reports, bind query parameters
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
              clusters: ['Income', 'Age', 'Household Size'],
            },
            'avg-daily-limits': {
              title: 'Extrema of daily consumption',
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
              clusters: ['Income', 'Age', 'Household Size'],
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
                      metric: 'AVERAGE',
                      limit: 3,
                    },
                    {
                      type: 'BOTTOM',
                      metric: 'AVERAGE',
                      limit: 3,
                    },
                  ],
                },
              },
              timespan: 'quarter', // default
              metrics: null, // n/a
              consolidate: null, // n/a
            }
          },
        },
        'month': {
          info: {
            name: 'month',
            title: 'Month',
            description: 'Report over month', // time unit of 1 month
          },
          reports: {
            /* nothing yet */
          },
        },
      },
    },

    // System Utilization //
    
    system: {
      info: {
        title: 'System Utilization',
      },
      computeKey: (level, reportName) => (
        [level, reportName].join('/')
      ),
      levels: {
        'week': {
          info: {
            name: 'week',
            title: 'Week',
            description: 'Report over week', // time unit of 1 week
          },
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
}
