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

d3.csv('/data/time_series_covid_19_confirmed.csv', dataset => {
    console.log(dataset)

    var margin = {top: 50, left: 50, right: 50, bottom: 50},
        height = 400 - margin.top - margin.bottom,
        width = 800 - margin.left - margin.right;
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

        displayCountry(svg, path, countries, dataset, '3/14/20')
        timeSlider(svg, path, countries, dataset, '1/22/20')
    }
})

function timeSlider(svg, path, countries, dataset, startingDate){
    // Time
    var dataTime = d3.range(0, 53).map(function(d) {
        return new Date(2020, 0, 22+d);
    });

    var sliderTime = d3
        .sliderBottom()
        .min(d3.min(dataTime))
        .max(d3.max(dataTime))
        .step(1000 * 60 * 60 * 24)
        .width(300)
        .tickFormat(d3.timeFormat('%Y/%B/%d'))
        .tickValues(dataTime)
        .default(new Date(2020, 0, 22))//TODO startingDate
        .on('onchange', val => {
            d3.select('p#value-time').text(d3.timeFormat('%Y/%B/%d')(val));
            const month = parseInt(d3.timeFormat('%m')(val))
            const day = parseInt(d3.timeFormat('%d')(val))
            const year = parseInt(d3.timeFormat('%Y')(val))%100
            console.log(month)
            displayCountry(svg, path, countries, dataset, `${month}/${day}/${year}`)
        });

    var gTime = d3
        .select('div#slider-time')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gTime.call(sliderTime);

    d3.select('p#value-time').text(d3.timeFormat('%Y/%B/%d')(sliderTime.value()));
}

function displayCountry(svg, path, countries, dataset, date) {
    console.log(date)
    const max = d3.max(dataset, d => parseInt(d['3/14/20']) + 1);
    const logMax = Math.log(max)

    svg.selectAll("*").remove()
    svg.selectAll(".country")
        .data(countries)
        .enter().append("path")
        .attr("class", "country")
        .attr("fill", (d, _) => {
            const name = d.properties.name
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