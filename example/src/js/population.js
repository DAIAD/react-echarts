'use strict';

class Ranking {
  
  constructor () { 
    if (arguments.length == 1) {
      let {type, field, metric, limit} = arguments[0];
      this._initialize(type, field, metric, limit);
    } else {
      this._initialize(...arguments);
    }
  }

  _initialize (type, field, metric, limit=3) {
    this.type = (['TOP', 'BOTTOM'].indexOf(type) < 0)? 'TOP' : type;
    this.field = field;
    this.metric = (['AVERAGE', 'MIN', 'MAX'].indexOf(metric) < 0)? 'AVERAGE' : metric;
    this.limit = parseInt(limit);
  }

  toJSON () {
    return {
      type: this.type,
      field: this.field,
      metric: this.metric,
      limit: this.limit,     
    };
  }

  toString () {
    return [
      'RANK', this.field, this.metric, this.type, this.limit.toString(), 
    ].join('/');
  }
};

Ranking.fromString = function (label) {
  var re = new RegExp(
    '^(?:RANK)[/](\\w+)[/](AVERAGE|MIN|MAX)[/](TOP|BOTTOM)[/]([\\d]+)$');
  var m = re.exec(label);
  return m? (new Ranking(m[3], m[1], m[2], m[4])) : null;
}

class Group {
  
  constructor(type='GROUP', name=null, id=null) {
    this.type = type;
    this.name = name;
    this.id = id;
  }

  toJSON () {
    return {
      type: this.type,
      label: this.toString(),
      id: this.id || this.name,
    }
  }

  toString () {
    return this.type + ':' + this.name;
  }
};

class Utility extends Group {
  
  constructor (name, id=null) {
    super('UTILITY', name, id);
  }
};

class ClusterGroup extends Group {
  
  constructor (name, clusterName, id=null) {
    super('GROUP', name);
    this.clusterName = clusterName;
  }
  
  toString () {
    return 'CLUSTER' + ':' + this.clusterName + ':' +  + this.name;
  }
};

Group.fromString = function (label) {
  // A factory for Group instances

  var r, m = (new RegExp('^([\\w]+)(?:[:](\\w+))?[:]([^/]+)$')).exec(label);
  if (!m)
    return null;
  
  switch (m[1]) {
    case 'GROUP':
      r = (m[2] == null)? (new Group('GROUP', m[3])) : null;
      break;
    case 'UTILITY':
      r = (m[2] == null)? (new Utility(m[3])) : null;
      break;
    case 'CLUSTER':
      r = (m[2] != null)? (new ClusterGroup(m[3], m[2])) : null;
      break;
    default:
      r = null;
      break;
  }
  return r
}

var fromString = function (label) {
  // Parse label and create a [Group, Ranking] pair
  // This pair represents a population target for data (measurement) queries
  
  var g, r;
  
  var i = label.indexOf('/');
  if (i < 0) {
    g = Group.fromString(label);
    r = null;
  } else {
    g = Group.fromString(label.substr(0, i)); 
    r = Ranking.fromString(label.substr(i +1));
  }
  return g? [g, r] : null;
}

module.exports = {Group, Utility, ClusterGroup, Ranking, fromString};
