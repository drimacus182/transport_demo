var args = process.argv.splice(process.execArgv.length + 2);
var file_in = args[0];
var file_out = args[1];


var d3 = require("d3");
var fs = require("fs");

var projection = d3.geoMercator()
    .center([30.404495, 50.4794])
    .scale(120500);

var buses_str = fs.readFileSync(file_in).toString();
var buses = d3.csvParse(buses_str);
var buses_out = transform_data(buses);
fs.writeFileSync(file_out, JSON.stringify(buses_out));


function transform_data(data) {
    return d3.nest()
        .key(d => +d.time).sortKeys((a,b) => (+a - (+b)))
        .rollup(function(leaves) {
            return leaves.map(function(d) {
                return [+d.lon, +d.lat];
            });
        })
        .entries(data)
        .map(function(d) {
            return d.value.filter(function(c){
                return c[0] != 0 & c[1] != 0;
            });
        })
        .map(function(d) {
            return d.map(function(c) {
                return projection(c).map(co => +(co.toFixed()));
            });
        });
}


