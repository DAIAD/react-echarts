var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouter = require('react-router');
var ReactRedux = require('react-redux');
var _ = require('lodash');

var PropTypes = React.PropTypes;
var {Nav, Navbar, NavItem, NavDropdown, MenuItem} = ReactBootstrap;
var {Router, Route, IndexRoute, Link, hashHistory} = ReactRouter;

var _configPropType = PropTypes.shape({
  utility: PropTypes.object,
  reports: PropTypes.object,
});

//
// Presentational components
//

var RootMenu = React.createClass({
  render: function () {
    return (
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand><a href="#">Utility Reports</a></Navbar.Brand>
          </Navbar.Header>
          <Nav activeHref={'#' + this.props.location.pathname}>
            <NavItem href="#/overview">Overview</NavItem>
            <NavDropdown title={'Analytics'} id="nav-dropdown-reports-water">
              <MenuItem header>Report over week</MenuItem>
              <MenuItem href="#/reports/measurements/volume/week/avg-daily-avg">
                Average of daily consumption
              </MenuItem> 
              <MenuItem href="#/reports/measurements/volume/week/avg-daily-peak">
                Peak of daily consumption
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
    config: _configPropType,
    params: PropTypes.shape({
      field: PropTypes.string,
      level: PropTypes.string,
      reportName: PropTypes.string,
    }) 
  },
  
  childContextTypes: {
    config: _configPropType, 
  },

  getChildContext: function() {
    return {config: this.props.config};
  },

  render: function () {
    var {Panel, Chart, Info} = require('./reports-measurements');
    
    var {config, params: {field, level, reportName}} = this.props; 
    
    var _config = config.reports.byType.measurements; 
    
    var heading = (
      <h3>
        {_config.fields[field].title}
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].title}
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].reports[reportName].title}
      </h3>
    );
    
    return (
      <div className="reports reports-measurements">
        {heading}
        <Panel field={field} level={level} reportName={reportName} />
        <Chart field={field} level={level} reportName={reportName} />
        <Info field={field} level={level} reportName={reportName} />
      </div>
    );
  },

});

var SystemReportsPage = React.createClass({
  
  propTypes: {
    config: _configPropType,
    params: PropTypes.shape({
      level: PropTypes.string,
      reportName: PropTypes.string,
    }),
  },
  
  childContextTypes: {
    config: _configPropType, 
  },

  getChildContext: function() {
    return {config: this.props.config};
  },

  render: function () {
    var {config, params: {level, reportName}} = this.props; 
    
    var _config = config.reports.byType.system; 
   
    var heading = (
      <h3>
        {_config.title} 
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].title}
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].reports[reportName].title}
      </h3>
    );
   
    return (
      <div className="reports reports-system">
        {heading}
        <ul>
          <li><em>Todo</em>:
          {'Avg time (days) between 2 consecutive data transmissions of participants'}</li>
          <li><em>Todo</em>:
          {'Max time (days) between 2 consecutive data transmissions (Top 10 participants)'}</li>
        </ul>
      </div>
    );
  },
});

var OverviewPage = React.createClass({
  
  propTypes: {
    config: _configPropType,
  },
 
  childContextTypes: {
    config: _configPropType, 
  },

  getChildContext: function() {
    return {config: this.props.config};
  },
 
  render: function () { 
    var {Overview} = require('./overview');
    
    var heading = 'Overview' 
    return (
      <div className="overview">
        <h3>{heading}</h3>
        <Overview />
      </div>
    );
  },
});

//
// Container components:
//

// Inject global configuration to basic page components
var injectConfigToProps = (state, ownProps) => ({
  config: state.config,
});

MeasurementReportsPage = ReactRedux.connect(injectConfigToProps, null)(MeasurementReportsPage); 

SystemReportsPage = ReactRedux.connect(injectConfigToProps, null)(SystemReportsPage); 

OverviewPage = ReactRedux.connect(injectConfigToProps, null)(OverviewPage); 

//
// Root
//

var Root = React.createClass({  
  render: function () {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={RootMenu}>
          <IndexRoute component={HomePage} />
          <Route path="about" component={AboutPage} />
          <Route path="overview" component={OverviewPage} />
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
