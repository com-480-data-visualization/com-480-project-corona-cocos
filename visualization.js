var margin = { top:50, left: 50, right:50, bottom:50},
height = 1000 - margin.top - margin.bottom,
width = 1900 - margin.left - margin.right;
console.log(height);
console.log(width);


var svg = d3.select("#map")
.append("svg")
.attr("height", height + margin.top + margin.bottom)
.attr("width", width + margin.left + margin.right)
.append("g")
.attr("transform", "translate("+margin.left+","+margin.top+")");

d3.queue()
.defer(d3.json, "world.topojson")
.await(ready)

var projection = d3.geoMercator()
    .translate([width / 2, height / 2 + 50])
    .scale(100);

var path = d3.geoPath()
    .projection(projection);

var countries;

function ready(error, data) {
    console.log('ready')

    countries = topojson.feature(data, data.objects.countries).features;

    console.log(countries);

    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
}

function europeZoom() {
    console.log("Europe zoom")
    projection = d3.geoMercator()
        .translate([width / 2, height / 2 + 50])
        .scale(400)

    path = d3.geoPath()
        .projection(projection);

    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("d", path)
}