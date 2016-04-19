var moment = global.moment || require('moment');

Granularity = function (name, quantity, unit)
{
  // This unit should be something understood by Moment.js
  // see http://momentjs.com/docs/#/manipulating/add/
  this.unit = unit;
  this.quantity = quantity;
  this.name = name;
}

Granularity.prototype.toDuration = function ()
{
  return moment.duration(this.quantity, this.unit);
}

Granularity.prototype.valueOf = function ()
{
  return this.toDuration().asMilliseconds();
}

Granularity.MILLISECOND = new Granularity('millisecond', 1, 'ms');
Granularity.SECOND = new Granularity('second', 1, 's');
Granularity.MINUTE = new Granularity('minute', 1, 'm');
Granularity.HOUR = new Granularity('hour', 1, 'h');
Granularity.DAY = new Granularity('day', 1, 'd');
Granularity.WEEK = new Granularity('week', 1, 'w');
Granularity.MONTH = new Granularity('month', 1, 'M');
Granularity.QUARTER = new Granularity('quarter', 1, 'Q');
Granularity.YEAR = new Granularity('year', 1, 'y');

// A (sorted descending) list of commonly used instances 
Granularity.common = [
  Granularity.MILLISECOND,
  Granularity.SECOND,
  Granularity.MINUTE,
  Granularity.HOUR,
  Granularity.DAY,
  Granularity.WEEK,
  Granularity.MONTH,
  Granularity.QUARTER,
  Granularity.YEAR,

];

Granularity.fromName = function (name) 
{
  return Granularity.common.find(v => (v.name == name));
}

module.exports = Granularity;
