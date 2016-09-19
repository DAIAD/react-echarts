var React = require('react');
var ReactBootstrap = require('react-bootstrap');
var ReactRouter = require('react-router');
var ReactRedux = require('react-redux');

var PropTypes = React.PropTypes;
var {Nav, Navbar, NavItem, NavDropdown, MenuItem} = ReactBootstrap;
var {Router, Route, IndexRoute, Link, hashHistory} = ReactRouter;

var sourceMeta = require('../source-metadata');

var ChartPane = require('./chart-pane');

var Demo = require('./demo');

var RootMenu = React.createClass({
  render: function ()
  {
    return (
      <div>
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand><a href="#">React-Echarts example!</a></Navbar.Brand>
          </Navbar.Header>
          <Nav activeHref={'#' + this.props.location.pathname}>
            <NavDropdown title={'Measurements'} id="stats-nav-dropdown">
              <MenuItem href="#/stats/water">Water Consumption</MenuItem> 
              <MenuItem href="#/stats/energy">Energy Consumption</MenuItem> 
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
    <h2>A demo: <a href="//github.com/DAIAD/react-echarts.git">DAIAD/react-echarts</a></h2>
    <Demo />
  </div>
);

var AboutPage = ({}) => (
  <div><h3>About me</h3><p>This is about me</p></div>
);

var StatsPage = ({params}) => (
  <div className="stats-page">
    <h3>Measurements / {sourceMeta[params.source].title}</h3>
    <ChartPane.Panel source={params.source} />
    <ChartPane.Chart source={params.source} />
  </div>
);

var Root = React.createClass({  
  render: function ()
  {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={RootMenu}>
          <IndexRoute component={HomePage} />
          <Route path="about" component={AboutPage} />
          <Route path="stats/:source" component={StatsPage} />
        </Route>
      </Router>
    );
  }
});

module.exports = Root;
