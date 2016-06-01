var funcs = {
 
  padRight: function (a, n, padding) {
    // Pad *in-place* the given array a from right to length n
    a.push.apply(a, Array(n - a.length).fill(padding));
    return a;
  },
  
  padLeft: function (a, n, padding) {
    // Pad *in-place* the given array a to length n
    a.unshift.apply(a, Array(n - a.length).fill(padding));
    return a;
  },
  
  diffNumber: function (_1, i, a) {
    // A  mapper that computes diffs of successive items
    return (i > 0)? (Number(a[i]) - Number(a[i - 1])): null; 
  },

  pairWithPrevious: function (value, i, a) {
    // A mapper that returns pairs of successive items
    var prevValue = (i > 0)? a[i - 1] : null;
    return [prevValue, value];
  },
  
  pairWithNext: function (value, i, a) {
    // A mapper that returns pairs of successive items
    var nextValue = (i + 1 < a.length)? a[i + 1] : null;
    return [value, nextValue];
  },

};

module.exports = funcs;
