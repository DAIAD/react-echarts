var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouter = require('react-router');
var ReactRedux = require('react-redux');
var _ = require('lodash');

var PropTypes = React.PropTypes;
var {Nav, Navbar, NavItem, NavDropdown, MenuItem} = ReactBootstrap;
var {Router, Route, IndexRoute, Link, hashHistory} = ReactRouter;

var config = require('../config-reports');

var RootMenu = React.createClass({
  render: function ()
  {
     return (
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand><a href="#">Utility Reports</a></Navbar.Brand>
          </Navbar.Header>
          <Nav activeHref={'#' + this.props.location.pathname}>
            <NavDropdown title={'Water Consumption'} id="nav-dropdown-reports-water">
              <MenuItem header>Report over week</MenuItem>
              <MenuItem href="#/reports/measurements/volume/week/avg-daily-avg">
                Average of daily consumption
              </MenuItem> 
              <MenuItem href="#/reports/measurements/volume/week/avg-daily-limits">
                Extrema of daily consumption
              </MenuItem> 
              <MenuItem href="#/reports/measurements/volume/week/top-3">
                Top consumers
              </MenuItem> 
              <MenuItem divider></MenuItem>
              <MenuItem header>Report over month</MenuItem>
              <MenuItem href="#/reports/measurements/volume/month/avg-daily-avg" disabled>
                Average of daily consumption
              </MenuItem> 
            </NavDropdown>
            <NavDropdown title={'System Utilization'} id="nav-dropdown-system-utilization">
              <MenuItem href="#/reports/system/week/data-transmission">
                Data Transmission
              </MenuItem> 
            </NavDropdown>
            <NavItem href="#/about">About</NavItem>
          </Nav>
        </Navbar>
        <div className="container page-inner">
          {this.props.children}
        </div>
      </div>
    );
  }
});

var HomePage = ({}) => (
  <div>
    <h3>Utility reports</h3>
    <p>See <a href="//github.com/DAIAD/react-echarts.git">DAIAD/react-echarts</a></p>
  </div>
);

var AboutPage = ({}) => (
  <div><h3>About</h3><p>This is about</p></div>
);

var MeasurementReportsPage = React.createClass({
  
  propTypes: {
    params: PropTypes.shape({
      field: PropTypes.oneOf(_.keys(config.reports.measurements.fields)),
      level: PropTypes.oneOf(_.keys(config.reports.measurements.levels)),
      reportName: PropTypes.string,
    }) 
  },

  render: function () {
    var {Panel, Chart} = require('./reports-measurements');
    
    var {field, level, reportName} = this.props.params; 
    var _config = config.reports.measurements;
    
    var heading = (
      <h3>
        {_config.fields[field].title}
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].info.title}
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].reports[reportName].title}
      </h3>
    );

    return (
      <div className="reports reports-measurements">
        {heading}
        <Panel field={field} level={level} reportName={reportName} />
        <Chart field={field} level={level} reportName={reportName} />
      </div>
    );
  },

});

var SystemReportsPage = React.createClass({
  
  propTypes: {
    params: PropTypes.shape({
      level: PropTypes.oneOf(_.keys(config.reports.system.levels)),
      reportName: PropTypes.string,
    }),
  },

  render: function () {
    var {level, reportName} = this.props.params;
    var _config = config.reports.system;
    
    var heading = (
      <h3>
        {_config.info.title} 
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].info.title}
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].reports[reportName].title}
      </h3>
    );
   
    return (
      <div className="reports reports-system">
        {heading}
        <em>Todo</em>
      </div>
    );
  },
});

var Root = React.createClass({  
  render: function () {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={RootMenu}>
          <IndexRoute component={HomePage} />
          <Route path="about" component={AboutPage} />
          <Route 
            path="reports/measurements/:field/:level/:reportName"
            component={MeasurementReportsPage} 
           />
          <Route 
            path="reports/system/:level/:reportName"
            component={SystemReportsPage} 
           />
        </Route>
      </Router>
    );
  }
});

// Export

module.exports = Root;
