var React = global.React || require('react');
var ReactBootstrap = global.ReactBootstrap || require('react-bootstrap');
var ReactRouter = global.ReactRouter || require('react-router');
var ReactRedux = global.ReactRedux || require('react-redux');

var PropTypes = React.PropTypes;
var {Nav, Navbar, NavItem, NavDropdown, MenuItem} = ReactBootstrap;
var {Router, Route, IndexRoute, Link, hashHistory} = ReactRouter;

var ChartPane = require('./chart-pane');

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
              <MenuItem href="#/stats/temperature">Temperature</MenuItem> 
              <MenuItem href="#/stats/humidity">Humidity</MenuItem> 
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
    <h3>An example!</h3>
    <p>An exmaple using <strong><a href="://github.com/DAIAD/react-echarts.git">DAIAD/react-echarts</a></strong></p>
  </div>
);

var AboutPage = ({}) => (
  <div><h3>About me</h3><p>This is about me</p></div>
);

var StatsPage = ({source, title}) => (
  <div>
    <h3>Measurements / {title}</h3>
    <ChartPane.Panel source={source} />
    <ChartPane.Chart source={source} />
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
          <Route path="stats/:source" 
            component={
              ({params}) => ( /* params provided by <Router> */
                <StatsPage 
                  source={params.source}
                  title={this.props.info[params.source].title} />
              )
            } 
           />
        </Route>
      </Router>
    );
  }
});

Root = ReactRedux.connect(
  (state, ownProps) => ({
    info: _.mapValues(state.stats, v => v.info),
  }), 
  null
)(Root);

module.exports = Root;
