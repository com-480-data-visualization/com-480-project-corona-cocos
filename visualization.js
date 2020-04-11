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

d3.csv('/generated/confirmed.csv', dataset => {
    console.log(dataset)

    var margin = {top: 50, left: 50, right: 50, bottom: 50},
        height = 400 - margin.top - margin.bottom,
        width = 700 - margin.left - margin.right;
    console.log(height);
    console.log(width);

    var svg = d3.select("#map")
        .append("svg")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.queue()
        .defer(d3.json, "world.topojson")
        .await(ready)

    var projection = d3.geoMercator()
        .translate([width / 2, height / 2 + 50])
        .scale(100);

    var path = d3.geoPath()
        .projection(projection);

    function ready(error, data) {
        console.log('ready')

        var countries = topojson.feature(data, data.objects.countries).features;
        console.log(topojson.feature(data, data.objects.countries))

        console.log(countries);

        displayCountries(svg, path, countries, dataset, '1/22/20')
        timeSlider(svg, path, countries, dataset, '1/22/20')
    }
})

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

    function prepare(d) {
        d.id = d.id;
        d.date = parseDate(d.date);
        return d;
    }

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
    const max = d3.max(dataset, d => parseInt(d['4/8/20']) / parseInt(d['population']) * 1_000_000 + 1);
    const logMax = Math.log2(max)

    var colorScale = d3.scaleLinear()
        .domain([0, 100])
        .range(['#FFFFFF', '#FF0000', '#000000']);

    // append a defs (for definition) element to your SVG
    var svgLegend = d3.select('body').append('svg')
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
    const max = d3.max(dataset, d => parseInt(d['4/8/20']) / parseInt(d['population']) * 1_000_000 + 1);
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
        .on("click", (d, _) => {
            const name = d.properties.name
            const match = dataset.filter(row => row['Country/Region'] === name)
            if (match.length > 0) {
                const infectedRate = parseInt(match[0][date]) / parseInt(match[0]['population'])

                console.log(name)
                console.log(`${infectedRate * 100}% of population infected`)
            }
        })
}