const minDate = "1/22/20";
const maxDate = "4/8/20";

const margin = {top: 50, left: 50, right: 50, bottom: 50},
	height = 600 - margin.top - margin.bottom,
	width = 1200 - margin.left - margin.right;

var svg = d3.select("#map")
	.append("svg")
	.attr("height", height + margin.top + margin.bottom)
	.attr("width", width + margin.left + margin.right)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

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

function hslToHex(h, s, l) {
    h /= 360;
    let r, g, b;
    if (s === 0) {
        r = g = b = l; // achromatic
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function timeSlider(svg, path, countries, dataset, startingDate) {
    var formatDateIntoYearMonth = d3.timeFormat("%b %Y");
    var formatDate = d3.timeFormat("%d %b");
    var parseDate = d3.timeParse("%m/%d/%y");

    var startDate = new Date("2020-01-22"),
        endDate = new Date("2020-04-08");

    const totalDays = (endDate - startDate) / (1000 * 3600 * 24)

    var margin = {top: 100, right: 20, bottom: -200, left: 20},
        width = 600 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    var svgSlider = d3.select("#vis")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

////////// slider //////////

    var moving = false;
    var currentValue = 0;
    var targetValue = width;

    var playButton = d3.select("#play-button");

    var x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, targetValue])
        .clamp(true);

    var slider = svgSlider.append("g")
        .attr("class", "slider")
        .attr("transform", "translate(" + margin.left + "," + height / 5 + ")");

    slider.append("line")
        .attr("class", "track")
        .attr("x1", x.range()[0])
        .attr("x2", x.range()[1])
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-inset")
        .select(function () {
            return this.parentNode.appendChild(this.cloneNode(true));
        })
        .attr("class", "track-overlay")
        .call(d3.drag()
            .on("start.interrupt", function () {
                slider.interrupt();
            })
            .on("start drag", function () {
                currentValue = d3.event.x;
                update(x.invert(currentValue));
            })
        );

    slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(5))
        .enter()
        .append("text")
        .attr("x", x)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function (d) {
            return formatDateIntoYearMonth(d);
        });

    var handle = slider.insert("circle", ".track-overlay")
        .attr("class", "handle")
        .attr("r", 9);

    var label = slider.append("text")
        .attr("class", "label")
        .attr("text-anchor", "middle")
        .text(formatDate(startDate))
        .attr("transform", "translate(0," + (-25) + ")")

    playButton
        .on("click", function () {
            var button = d3.select(this);
            if (button.text() === "Pause") {
                moving = false;
                clearInterval(timer);
                // timer = 0;
                button.text("Play");
            } else {
                moving = true;
                timer = setInterval(step, 200);
                button.text("Pause");
            }
        })

    function step() {
        update(x.invert(currentValue));
        currentValue = currentValue + (targetValue / totalDays);
        if (currentValue > targetValue) {
            moving = false;
            currentValue = 0;
            clearInterval(timer);
            // timer = 0;
            playButton.text("Play");
        }
    }

    function update(h) {
        // update position and text of label according to slider scale
        handle.attr("cx", x(h));
        label
            .attr("x", x(h))
            .text(formatDate(h));

        // Update the map
        const month = parseInt(d3.timeFormat('%m')(h))
        const day = parseInt(d3.timeFormat('%d')(h))
        const year = parseInt(d3.timeFormat('%Y')(h)) % 100
        updateCountriesColor(svg, path, countries, dataset, `${month}/${day}/${year}`)
    }
}

/**
 * Display countries given topojson data and infected people data
 * @param svg to display the map on
 * @param path projection world map (such as Mercator)
 * @param countries topojson data
 * @param dataset infected people data
 * @param date
 */
function displayCountries(svg, path, countries, dataset, date) {
    const max = d3.max(dataset, d => parseInt(d[maxDate]) / parseInt(d['population']) * 1_000_000 + 1);
    const logMax = Math.log2(max)

    var colorScale = d3.scaleLinear()
        .domain([0, 100])
        .range(['#FFFFFF', '#FF0000', '#000000']);

    // append a defs (for definition) element to your SVG
    var svgLegend = d3.select("#legend").append('svg')
        .attr("width", 900);
    var defs = svgLegend.append('defs');

    // append a linearGradient element to the defs and give it a unique id
    var linearGradient = defs.append('linearGradient')
        .attr('id', 'linear-gradient');

    // horizontal gradient
    linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");

    // append multiple color stops by using D3's data/enter step
    linearGradient.selectAll("stop")
        .data([
            {offset: "0%", color: "#FFFFFF"},
            {offset: "50%", color: "#FF0000"},
            {offset: "100%", color: "#000000"}
        ])
        .enter().append("stop")
        .attr("offset", function (d) {
            return d.offset;
        })
        .attr("stop-color", function (d) {
            return d.color;
        });

    // append title
    svgLegend.append("text")
        .attr("class", "legendTitle")
        .attr("x", 0)
        .attr("y", 20)
        .style("text-anchor", "left")
        .text("Legend title");

    // draw the rectangle and fill with gradient
    svgLegend.append("rect")
        .attr("x", 10)
        .attr("y", 30)
        .attr("width", 791)
        .attr("height", 15)
        .style("fill", "url(#linear-gradient)");

    //create tick marks
    console.log(`max ${(max - 1)/1_000_000}`)
    var xLeg = d3.scaleLog()
        .domain([1/1_000_000,(max - 1)/1_000_000])
        .range([10, 800]) // This is where the axis is placed: from 10 px to 400px
        .base(2)


    var axisLeg = d3.axisBottom(xLeg)
        .tickFormat(d3.format(".2s"))

    svgLegend
        .attr("class", "axis")
        .append("g")
        .attr("transform", "translate(0, 40)")
        .call(axisLeg);

    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("stroke-width", 0.3)
        .attr("stroke", "black")
        .attr("d", path)

    updateCountriesColor(svg, path, countries, dataset, date)
}

function updateCountriesColor(svg, path, countries, dataset, date) {
    const max = d3.max(dataset, d => parseInt(d[maxDate]) / parseInt(d['population']) * 1_000_000 + 1);
    const logMax = Math.log2(max)

    svg.selectAll(".country")
        .attr("fill", (d, _) => {
            const name = d.properties.name
            const match = dataset.filter(row => row['Country/Region'] === name)
            if (match.length > 0) {
                const logInfected = Math.log2(parseInt(match[0][date]) / parseInt(match[0]['population']) * 1_000_000 + 1)
                return hslToHex(0, 1, 1 - logInfected / logMax)
            } else {
                return hslToHex(180, 1, 50)
            }
        })
        .on("click", d => onCountryClicked(d, dataset, date))
}

function onCountryClicked(countryData, dataset, date) {
    const name = countryData.properties.name
    const match = dataset.filter(row => row['Country/Region'] === name)
    if (match.length > 0) {
        const infectedRate = parseInt(match[0][date]) / parseInt(match[0]['population'])

        console.log(name)
        console.log(`${infectedRate * 100}% of population infected`)
        console.log(`${parseInt(match[0][date]) } people infected`)
    }

    console.log(match);


    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Read the data
    d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_IC.csv",function(data) {

        // Add X axis --> it is a date format
        var x = d3.scaleTime()
            .domain([minDate,maxDate])
            .range([ 0, width ]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 13])
            .range([ height, 0 ]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // This allows to find the closest X index of the mouse:
        var bisect = d3.bisector(function(d) { return d.x; }).left;

        // Create the circle that travels along the curve of chart
        var focus = svg
            .append('g')
            .append('circle')
            .style("fill", "none")
            .attr("stroke", "black")
            .attr('r', 8.5)
            .style("opacity", 0)

        // Create the text that travels along the curve of chart
        var focusText = svg
            .append('g')
            .append('text')
            .style("opacity", 0)
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle")

        // Create a rect on top of the svg area: this rectangle recovers mouse position
        svg
            .append('rect')
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('width', width)
            .attr('height', height)
            //.on('mouseover', mouseover)
            //.on('mousemove', mousemove)
            //.on('mouseout', mouseout);

        // Add the line
        svg
            .append("path")
            .datum(dataset)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) {
                    return x(d.x)
                })
                .y(function(d) {
                    return y(d.y)
                })
            )


        // What happens when the mouse move -> show the annotations at the right positions.
        function mouseover() {
            focus.style("opacity", 1)
            focusText.style("opacity",1)
        }

        function mousemove() {
            // recover coordinate we need
            var x0 = x.invert(d3.mouse(this)[0]);
            var i = bisect(data, x0, 1);
            selectedData = data[i]
            focus
                .attr("cx", x(selectedData.x))
                .attr("cy", y(selectedData.y))
            focusText
                .html("x:" + selectedData.x + "  -  " + "y:" + selectedData.y)
                .attr("x", x(selectedData.x)+15)
                .attr("y", y(selectedData.y))
        }
        function mouseout() {
            focus.style("opacity", 0)
            focusText.style("opacity", 0)
        }

    })
}

d3.csv('/generated/confirmed.csv', dataset => {
    console.log(dataset)

    console.log(height);
    console.log(width);


    d3.queue()
        .defer(d3.json, "world.topojson")
        .await(ready)

    var projection = d3.geoMercator()
        .scale(100);

    var path = d3.geoPath()
        .projection(projection);

    function ready(error, data) {
        console.log('ready')

        var countries = topojson.feature(data, data.objects.countries).features;
        console.log(topojson.feature(data, data.objects.countries))

        console.log(countries);


        displayCountries(svg, path, countries, dataset, minDate)
        timeSlider(svg, path, countries, dataset, minDate)
        continentZoom('worldButton')
    }
})
