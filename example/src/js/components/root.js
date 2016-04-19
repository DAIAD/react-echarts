var React = global.React || require('react');
var ReactBootstrap = global.ReactBootstrap || require('react-bootstrap');
var ReactRouter = global.ReactRouter || require('react-router');
var ReactRedux = global.ReactRedux || require('react-redux');

var {Nav, Navbar, NavItem} = ReactBootstrap;
var {Router, Route, IndexRoute, Link, hashHistory} = ReactRouter;
var actions = require('../actions');
var charts = require('./react-echarts');
var LineChart = charts.LineChart;

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
            <NavItem href="#/stats/temperature">Temperature Stats</NavItem>
            <NavItem href="#/stats/humidity">Humidity Stats</NavItem>
            <NavItem href="#/about">About</NavItem>
          </Nav>
        </Navbar>
        {this.props.children}
      </div>
    );
  }
});

var AboutPage = ({}) => (<div><h4>A demo using <em>DAiAD/react-echarts</em></h4></div>);

var Root = React.createClass({
  render: function ()
  {
    return (
      <Router history={hashHistory}>
        <Route path="/" component={RootMenu}>
          <Route path="about" component={AboutPage} />
          <Route path="stats/temperature" component={AboutPage} />
          <Route path="stats/humidity" component={AboutPage} />
        </Route>
      </Router>
    );
  }
});

// Container component

//const mapStateToProps = (state, ownProps) => ({
//  route: state.route,
//});

//const mapDispatchToProps = (dispatch, ownProps) => ({
//  refreshData: function () {
//    console.info('Loading series data...');
//    dispatch(actions.refreshTemperatureData());
//  },
//});

//Root = ReactRedux.connect(mapStateToProps, mapDispatchToProps)(Root)

module.exports = Root;
