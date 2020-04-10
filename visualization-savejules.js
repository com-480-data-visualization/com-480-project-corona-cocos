var margin = { top:50, left: 50, right:50, bottom:50},
height = 600 - margin.top - margin.bottom,
width = 1200 - margin.left - margin.right;
console.log(height);
console.log(width);


var svg = d3.select("#map")
.append("svg")
.attr("height", height + margin.top + margin.bottom)
.attr("width", width + margin.left + margin.right)
.append("g")
.attr("transform", "translate("+margin.left+","+margin.top+")")
.on('click', continentZoom);

d3.queue()
.defer(d3.json, "world.topojson")
.await(ready)

var projection = d3.geoMercator()
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
		//continentZoom('worldButton')
}

function continentZoom(idButton) {
	let x
	let y
	let zoom

	if (idButton == 'worldButton') {
		zoom = 2
		x = width/20
		y = height/10
	} else if(idButton == 'euButton') {
		zoom = 6
		x = width/20
		y = height/4
	} else if(idButton == 'asiaButton') {
		x = -width/10
		y = height/6
		zoom = 3
	} else if(idButton == 'naButton') {
		x = width/4.5
		y = height/5
		zoom = 4.5
	} else if(idButton == 'saButton') {
		x = width/7
		y = -height/18
		zoom = 4.2
	} else if(idButton == 'afrButton') {
		x = width/20
		y = height/20
		zoom = 3.8
	} else if(idButton == 'austrButton') {
		x = -width/7
		y = -height/15
		zoom = 3.8
	}

	console.log(x+" "+width)
	console.log(y+" "+height)

	center_x = (width/2)-(width/(zoom*2))
	center_y = height/2-height/(zoom*2)

	console.log("cx"+center_x+" cy"+center_y)

	x = -center_x + x
	y = -center_y + y

	console.log('x final '+x+" y final "+y)

	let s = `scale(${zoom})`+`translate(${x},${y})`
	console.log("str: "+s)

	svg.transition()
		.duration(1000)
		.attr('transform', s)
}
