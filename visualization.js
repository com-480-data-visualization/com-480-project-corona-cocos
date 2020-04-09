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

        displayCountry(svg, path, countries, dataset, '4/8/20')
        timeSlider(svg, path, countries, dataset, '1/22/20')
    }
})

function timeSlider(svg, path, countries, dataset, startingDate) {
    var formatDateIntoYearMonth = d3.timeFormat("%b %Y");
    var formatDate = d3.timeFormat("%d %b");
    var parseDate = d3.timeParse("%m/%d/%y");

    var startDate = new Date("2020-01-20"),
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
            console.log("Slider moving: " + moving);
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
            console.log("Slider moving: " + moving);
        }
    }

    function update(h) {
        console.log(h)
        // update position and text of label according to slider scale
        handle.attr("cx", x(h));
        label
            .attr("x", x(h))
            .text(formatDate(h));

        // Update the map
        const month = parseInt(d3.timeFormat('%m')(h))
        const day = parseInt(d3.timeFormat('%d')(h))
        const year = parseInt(d3.timeFormat('%Y')(h)) % 100
        displayCountry(svg, path, countries, dataset, `${month}/${day}/${year}`)
    }
}

function displayCountry(svg, path, countries, dataset, date) {
    console.log(date)
    const max = d3.max(dataset, d => parseInt(d['4/8/20']) + 1);
    const logMax = Math.log(max)

    svg.selectAll("*").remove()
    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("fill", (d, _) => {
            const name = d.properties.name
            console.log(d.properties.name)
            const match = dataset.filter(row => row['Country/Region'] === name)
            if (match.length > 0) {
                const logInfected = Math.log(parseInt(match[0][date]) + 1)
                return hslToHex(0, 1, 1 - logInfected / logMax / 2)
            } else {
                return hslToHex(0, 1, 0)
            }
        })
        .attr("stroke-width", 0.3)
        .attr("stroke", "black")
        .on("click", (d, _) => {
            const name = d.properties.name
            const match = dataset.filter(row => row['Country/Region'] === name)
            if (match.length > 0) {
                const logInfected = Math.log(parseInt(match[0][date]) + 1)

                console.log(logInfected)
                console.log(logMax)
                console.log(1 - (logInfected / logMax / 2))
            }
            console.log(d.properties.name)
        })
        .attr("d", path)
}