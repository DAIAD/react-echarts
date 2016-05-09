'use strict';

class Group {
  
  constructor(type, name, id, clusterName) {
    this.type = type;
    this.name = name;
    this.id = id;
    this.clusterName = clusterName;
  }

  stringify (ranking=null) {
    // Todo
  }

  static parse (label) {
    // Todo
  }
};

class Utility extends Group {
  
  constructor(name, id) {
    super('UTILITY', name, id, null);
  }
  
  stringify (ranking=null) {
    
  }

  static parse (label) {
    // Todo
  }

};


/*
generate: (name, ranking, s=null) => (
  s = 'UTILITY:' + name,
  ranking? (s + '/RANK' + '/' + ranking.metric + '/' + ranking.type + '/' + ranking.limit) : s
),
parse: (subj, m=null, p='^UTILITY:([^/]*)(?:[/](?:(RANK)[/](AVERAGE|MIN|MAX)[/](TOP|BOTTOM)[/]([\\d])))?$') => (
  m = (new RegExp(p)).exec(subj),
  !m? null : {
    name: m[1],
    ranking: (m[2] == 'RANK')? {type: m[4], metric: m[3], limit: parseInt(m[5])} : null,
  }
),
*/

module.exports = {Group, Utility};
