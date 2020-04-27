const minDate = "2020-01-22";
const maxDate = "2020-04-25";
const startDate = new Date(minDate);
const endDate = new Date(maxDate);
const ticksCount = 5;
const noDataColor = "#eab11f"

function timeToString(date) {
    return d3.timeFormat("%Y-%m-%d")(date)
}

function formatNumberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatMatch(match) {
    var formatted = []
    for (var d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        formatted.push({date: new Date(d), value: match[timeToString(d)]});
    }
    return formatted
}

const margin = {top: 50, left: 50, right: 50, bottom: 50},
    height = 600 - margin.top - margin.bottom,
    width = 1200 - margin.left - margin.right;

var map_svg = d3.select("#map")
    .append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

function continentZoom(idButton) {
    d3.select("#zoomDropdownButton").text("Focus: " + d3.select("#" + idButton).text());

    let x;
    let y;
    let zoom;
    let region;

    if (idButton == 'worldButton') {
        x = width / 20
        y = height / 10
        zoom = 2
        region = "World"
    } else if (idButton == 'euButton') {
        x = width / 20
        y = height / 4
        zoom = 6
        region = "Europe"
    } else if (idButton == 'asiaButton') {
        x = -width / 10
        y = height / 6
        zoom = 3
        region = "Asia"
    } else if (idButton == 'naButton') {
        x = width / 4.5
        y = height / 5
        zoom = 4.5
        region = "North America"
    } else if (idButton == 'saButton') {
        x = width / 7
        y = -height / 18
        zoom = 4.2
        region = "South America"
    } else if (idButton == 'afrButton') {
        x = width / 20
        y = height / 20
        zoom = 3.8
        region = "Africa"
    } else if (idButton == 'austrButton') {
        x = -width / 7
        y = -height / 15
        zoom = 3.8
        region = "Australia"
    }

    //console.log(x + " " + width)
    //console.log(y + " " + height)

    center_x = (width / 2) - (width / (zoom * 2))
    center_y = height / 2 - height / (zoom * 2)

    //console.log("cx" + center_x + " cy" + center_y)

    x = -center_x + x
    y = -center_y + y

    //console.log('x final ' + x + " y final " + y)

    let s = `scale(${zoom})` + `translate(${x},${y})`
    //console.log("str: " + s)

    map_svg.transition()
        .duration(1000)
        .attr('transform', s)

    // Change information to region zoomed
    data.current_country = region;
    plotCountry();
    updateCountryInfo();
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

function timeSlider(svg, path, coutries_data) {
    var formatDateIntoYearMonth = d3.timeFormat("%b %Y");
    var formatDate = d3.timeFormat("%d %b");

    const totalDays = (endDate - startDate) / (1000 * 3600 * 24)

    var margin = {top: 100, right: 20, bottom: -200, left: 20},
        width = 600 - margin.left - margin.right,
        height = 80 - margin.top - margin.bottom;

    var svgSlider = d3.select("#slider")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

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
        .attr("class", "whiteContent")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x.ticks(ticksCount))
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
        .attr("fill", "white")
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
        dataset = getDatasetFromName(data.current_dataset);
        data.current_date = timeToString(h);
        updateCountriesColor(map_svg, path, coutries_data, dataset, timeToString(h));
        updateCountryInfo();
    }
}

/**
 * Display countries given topojson data and infected people data
 * @param svg to display the map on
 * @param path projection world map (such as Mercator)
 * @param coutries_data topojson data
 * @param dataset infected people data
 * @param date
 */
function displayCountries(svg, path, coutries_data, dataset, date) {
    map_svg.selectAll(".country")
        .data(coutries_data)
        .enter().append("path")
        .attr("class", "country")
        .attr("stroke-width", 0.3)
        .attr("stroke", "black")
        .attr("d", path)

    updateCountriesColor(map_svg, path, coutries_data, dataset, date)
}

function displayLegend(countriesData) {
    // Remove previous graphs
    d3.select("#legend").selectAll("*").remove();

    dataset = getDatasetFromName(countriesData);

    const max = d3.max(dataset, d => Math.max.apply(Math, formatMatch(d).map(function (o) {
        return o.value;
    })) / parseInt(d['population']) * 1_000_000 + 1);

    // append a defs (for definition) element to your SVG
    var svgLegend = d3.select("#legend").append('svg')
        .attr("width", 1200);
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
        .attr("fill", "#FFFFFF")
        .style("text-anchor", "left")
        .text("Count relative to country's population");

    // draw the rectangle and fill with gradient
    svgLegend.append("rect")
        .attr("x", 10)
        .attr("y", 30)
        .attr("width", 1191)
        .attr("height", 15)
        .style("fill", "url(#linear-gradient)");

    console.log(max)
    //create tick marks
    var xLeg = d3.scaleLog()
        .domain([1 / 1_000_000, (max - 1) / 1_000_000])
        .range([10, 1199]) // This is where the axis is placed: from 10 px to 400px
        .base(2);


    var x2 = d3.axisBottom(xLeg).tickFormat(d3.format(".2s"));

    svgLegend
        .append("g")
        .attr("class", "whiteContent")
        .attr("transform", "translate(0, 45)")
        .call(x2);

    // No data text
    svgLegend.append("text")
        .attr("class", "legendTitle")
        .attr("x", 30)
        .attr("y", 76)
        .attr("fill", "#FFFFFF")
        .style("text-anchor", "left")
        .text("No data");

    // Square no data color
    svgLegend.append("rect")
        .attr("x", 10)
        .attr("y", 63)
        .attr("width", 15)
        .attr("height", 15)
        .style("stroke-width", 1)
        .style("stroke", "white")
        .style("fill", noDataColor);

    /*svgLegend.append("g")
        .attr("class", "whiteContent")
        .attr("transform", "translate(0," + 45 + ")")
        .call(d3.axisBottom(x).ticks(ticksCount));*/
}

function updateCountriesColor(svg, path, coutries_data, dataset, date) {
    const max = d3.max(dataset, d => parseInt(d[maxDate]) / parseInt(d['population']) * 1_000_000 + 1);
    const logMax = Math.log2(max)

    map_svg.selectAll(".country")
        .attr("fill", (d, _) => {
            const name = d.properties.name;
            const match = dataset.filter(row => row['Country/Region'] === name);
            if (match.length > 0) {
                const logInfected = Math.log2(parseInt(match[0][date]) / parseInt(match[0]['population']) * 1_000_000 + 1);
                return hslToHex(0, 1, 1 - logInfected / logMax);
            } else {
                return noDataColor;
            }
        })
        .on("click", d => {
            data.current_country = d.properties.name;
            plotCountry();
            updateCountryInfo();
        })
}

function updateCountryInfo() {
    d3.select("#info_country_name").text(data.current_country)
    d3.select("#info_country_confirmed").text("Confirmed: "
        + formatNumberWithCommas(getDatasetFromName('confirmed').filter(row => row['Country/Region'] === data.current_country)[0][data.current_date]))
    d3.select("#info_country_deaths").text("Deaths: "
        + formatNumberWithCommas(getDatasetFromName('deaths').filter(row => row['Country/Region'] === data.current_country)[0][data.current_date]))
    d3.select("#info_country_recovered").text("Recovered: "
        + formatNumberWithCommas(getDatasetFromName('recovered').filter(row => row['Country/Region'] === data.current_country)[0][data.current_date]))
    d3.select("#info_country_active_cases").text("Active cases: "
        + formatNumberWithCommas(getDatasetFromName('sick').filter(row => row['Country/Region'] === data.current_country)[0][data.current_date]))
}

function plotCountry() {
    dataset = getDatasetFromName(data.current_dataset)
    const match = dataset.filter(row => row['Country/Region'] === data.current_country)[0]

    const matchRows = formatMatch(match);

    const maxValue = Math.max.apply(Math, matchRows.map(function (o) {
        return o.value;
    }));

    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    // Remove previous graphs
    d3.select("#graph").selectAll("*").remove();

    // append the svg object to the body of the page
    var svg = d3.select("#graph")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add X axis --> it is a date format
    var x = d3.scaleTime()
        .domain([startDate, endDate])
        .range([0, width]);
    svg.append("g")
        .attr("class", "whiteContent")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(ticksCount));

    // Add Y axis
    let y;

    if(document.getElementById('radio-log').checked) {
        // Log
        y = d3.scaleLog().base(2)
    } else {
        // Linear
        y = d3.scaleLinear()
    }

    y = y.domain([1, maxValue])
        .range([height, 0]);

    svg.append("g")
        .attr("class", "whiteContent")
        .call(d3.axisLeft(y));

    // This allows to find the closest X index of the mouse:
    var bisect = d3.bisector(function (d) {
        return d.date;
    }).left;

    // Add the line
    svg.append("path")
        .datum(matchRows)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(function (d) {
                return x(d.date)
            })
            .y(function (d) {
                return y(parseInt(d.value) + 1)
            })
        );

    // Create the circle that travels along the curve of chart
    var focus = svg
        .append('g')
        .attr("class", "whiteContent")
        .append('circle')
        .style("fill", "red")
        .attr('r', 5)
        .style("opacity", 0)

    // Create the text that travels along the curve of chart
    var focusText = svg
        .append('g')
        .attr("class", "whiteContent")
        .append('text')
        .style("opacity", 0)
        .attr("text-anchor", "left")
        .attr("alignment-baseline", "middle")
        .attr("transform",
            "translate(" + 13 + "," + 10 + ")");

    // Create a rect on top of the svg area: this rectangle recovers mouse position
    svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);


    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
        focus.style("opacity", 1);
        focusText.style("opacity", 1);
    }

    function mousemove() {
        // recover coordinate we need
        var x0 = x.invert(d3.mouse(this)[0]);
        var i = bisect(matchRows, x0, 1);
        selectedData = matchRows[i];
        focus
            .attr("cx", x(selectedData.date))
            .attr("cy", y(parseInt(selectedData.value) + 1));
        focusText
            .html(d3.timeFormat("%d %b")(selectedData.date) + ": " + formatNumberWithCommas(selectedData.value))
            .attr("x", x(selectedData.date))
            .attr("y", y(parseInt(selectedData.value) + 1));

        if (x(selectedData.date) >= x(endDate) / 2) {
            focusText.attr("transform", "translate(" + (-focusText.node().getBBox().width - 13) + "," + 10 + ")");
        } else {
            focusText.attr("transform", "translate(" + 13 + "," + 10 + ")");
        }
    }

    function mouseout() {
        focus.style("opacity", 0);
        focusText.style("opacity", 0);
    }
}

function getDatasetFromName(name) {
    if (name === 'deaths') {
        return data.deaths;
    } else if (name === 'confirmed') {
        return data.confirmed;
    } else if (name === 'sick') {
        return data.sick;
    } else {
        return data.recovered;
    }
}

function changeDataset(dataset_name) {
    data.current_dataset = dataset_name;

    document.getElementById('datasetDropdownButton').innerHTML = "Data: " + d3.select("#" + dataset_name).text();
    updateCountriesColor(map_svg, data.world_path, data.countries_data, getDatasetFromName(dataset_name), data.current_date);
    displayLegend(data.current_dataset);
    plotCountry();
}

const data = {}
d3.csv('./generated/confirmed.csv', confirmed_data => {
    data.confirmed = confirmed_data;
    data.current_dataset = 'confirmed';
    data.current_date = minDate;
    data.current_country = "World";

    d3.csv('./generated/deaths.csv', deaths_data => {
        data.deaths = deaths_data;
    })
    d3.csv('./generated/recovered.csv', recovered_data => {
        data.recovered = recovered_data;
    })
    d3.csv('./generated/sick.csv', sick_data => {
        data.sick = sick_data;
    })
    d3.queue()
        .defer(d3.json, "world.topojson")
        .await(ready)

    const projection = d3.geoMercator()
        .scale(100);

    const world_path = d3.geoPath()
        .projection(projection);
    data.world_path = world_path

    function ready(error, world_data) {
        const countries_data = topojson.feature(world_data, world_data.objects.countries).features;
        data.countries_data = countries_data;

        displayCountries(map_svg, world_path, countries_data, confirmed_data, minDate);
        displayLegend(countries_data);
        timeSlider(map_svg, world_path, countries_data, confirmed_data);
        continentZoom('worldButton');
        plotCountry();
        updateCountryInfo();
    }
})
