var React = global.React || require('react');

var Section = React.createClass({
  
  getDefaultProps: function ()
  {
    return {
      name: 'Temperature',
      unit: '°C',
    };
  },

  render: function ()
  {
    return (
      <section id='chart-section'>
        <h3>Example #1: Lines/Areas</h3>
        <LineChart 
          xAxis={{
            data: ['Mo','Tu','We','Th','Fr','Sa','Su'],
          }}
          yAxis={{
            name: this.props.sourceName,
            numTicks: 3,
            formatter: (y) => (y.toString() + this.props.sourceUnit)
          }}
          refreshData={this.props.refreshData}
         />
        <div className="panel">
          <button 
            onClick={(ev) => (this.props.refreshData(), false)}
           >Refresh</button>
          <button 
            onClick={(ev) => (console.info('Cleanup'), false)}
           >Cleanup</button>
        </div>
      </section>
    );
  }
});

module.exports = Section;
