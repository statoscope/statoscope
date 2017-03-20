var entity = require('basis.entity');
var Point = require('./point');

var Range = entity.createType('Range', {
    start: Point,
    end: Point
});

module.exports = Range;
