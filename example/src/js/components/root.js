'use strict';

var moment = require('moment');
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
            <NavDropdown title="Overview" id="nav-dropdown-overview">
              <MenuItem href="#/overview/utility">Utility</MenuItem>
              <MenuItem href="#/overview/per-efficiency">Per customer efficiency</MenuItem>
              <MenuItem href="#/overview/per-household-members">Per household members</MenuItem>
              <MenuItem href="#/overview/per-household-size">Per household size</MenuItem>
              <MenuItem href="#/overview/per-income">Per income</MenuItem>
            </NavDropdown>
            <NavDropdown title="Analytics" id="nav-dropdown-reports-measurements">
              <MenuItem header>Report over week</MenuItem>
              <MenuItem href="#/reports/measurements/volume/week/weekly-avg">Average of weekly consumption</MenuItem> 
              <MenuItem href="#/reports/measurements/volume/week/avg-daily-avg">Average of daily consumption</MenuItem> 
              <MenuItem href="#/reports/measurements/volume/week/avg-daily-peak">Peak of daily consumption</MenuItem> 
              <MenuItem href="#/reports/measurements/volume/week/top-k">Top consumers</MenuItem> 
              <MenuItem divider></MenuItem>
              <MenuItem header>Report over month</MenuItem>
              <MenuItem href="#/reports/measurements/volume/month/avg-daily-avg" disabled>Average of daily consumption</MenuItem> 
            </NavDropdown>
            <NavDropdown title="System Utilization" id="nav-dropdown-system-utilization">
              <MenuItem header>Report over week</MenuItem>
              <MenuItem href="#/reports/system/week/data-transmission">Data Transmission</MenuItem>
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
    <h2>Utility reports</h2>
    <p>See <a href="//github.com/DAIAD/react-echarts.git">DAIAD/react-echarts</a></p>
  </div>
);

var AboutPage = ({}) => (
  <div><h2>About</h2><p>This is about</p></div>
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
    var {Panel, Chart, Info} = require('./reports-measurements/pane');
 
    var {config, params: {field, level, reportName}} = this.props; 
    var _config = config.reports.byType.measurements; 
    
    var heading = (
      <h2>
        {_config.fields[field].title}
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].title}
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].reports[reportName].title}
      </h2>
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
      <h2>
        {_config.title} 
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].title}
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {_config.levels[level].reports[reportName].title}
      </h2>
    );
    
    var Report;
    switch (reportName) {
      case 'data-transmission':
      default:
        Report = require('./reports-system/data-transmission').Report;
        break;
    }

    return (
      <div className="reports reports-system">
        {heading}
        <Report level={level} reportName={reportName} />
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
    var overview = require('./reports-measurements/overview');
    var {config, params: {section}, location: {query: q}} = this.props; 
    
    var startAt = Number(q.start); 
    startAt = _.isNaN(startAt)? moment().valueOf() : startAt;

    var body;
    switch (section) {
      case 'utility':
      default:
        body = (<overview.UtilityView startAt={startAt} />);
        break;
      case 'per-efficiency':
        body = (<overview.GroupPerEfficiencyView startAt={startAt} />);
        break;
      case 'per-household-size':
        body = (<overview.GroupPerSizeView startAt={startAt} />);
        break;
      case 'per-household-members':
        body = (<overview.GroupPerMembersView startAt={startAt} />);
        break;
      case 'per-income':
        body = (<overview.GroupPerIncomeView startAt={startAt} />);
        break;
    }
  
    var heading = (
       <h2>
        {'Overview'}
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {'Water Consumption'}
        <span className="delimiter">&nbsp;/&nbsp;</span>
        {config.overview.sections[section].title}
      </h2>
    );

    return (
      <div className="overview">
        {heading}
        {body}
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
          <Route 
            path="overview/:section" 
            component={OverviewPage} 
           />
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
