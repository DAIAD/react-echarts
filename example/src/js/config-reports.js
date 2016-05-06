
module.exports = {
  
  population: {
    // Todo Configure each grouping and define its groups (i.e clusters) that
    // is made of (UUIDs, titles etc.)
    groupBy: {
      'start-date': {
        /* Todo */
      },
      'family-size': {
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
      'income': {
        /* Todo */
      },
    },
  },
  
  reports: {
    measurements: {
      info: {
        title: 'Measurements',
      },
      getKey: (field, level, reportName) => ([field, level, reportName].join('/')),
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
                metrics: ['COUNT', 'SUM', 'AVERAGE']
              },
              timespan: 'quarter', // default
              metrics: ['AVERAGE'],
              consolidate: 'AVERAGE',
              groupBy: ['start-date', 'family-size', 'income'],
            },
            'avg-daily-limits': {
              title: 'Extrema of daily consumption',
              description: 'The weekly average of the daily min/max consumption',
              queryParams: {
                time: {
                  granularity: 'DAY'
                },
                metrics: ['COUNT', 'SUM', 'MIN', 'MAX']
              },
              timespan: 'quarter', // default
              metrics: ['MIN', 'MAX'],
              consolidate: 'AVERAGE',
              groupBy: ['start-date', 'family-size', 'income'],
            },
            'top-3': {
              title: 'Top 3 consumers',
              description: 'The weekly 3 top/bottom consumers',
              queryParams: {
                time: {
                  granularity: 'WEEK'
                },
                population: {
                  ranking: {
                    type: ['TOP', 'BOTTOM'],
                    metric: 'AVERAGE',
                    field: 'VOLUME',
                    limit: 3,
                  },
                },
                metrics: ['COUNT', 'SUM', 'MIN', 'MAX', 'AVERAGE'],
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
      getKey: (level, reportName) => ([level, reportName].join('/')),
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
