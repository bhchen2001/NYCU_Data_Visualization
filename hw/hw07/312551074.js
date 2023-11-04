// set the size of svg
const width = 1080; const height = 1000;
const margin = {top: 10, right: 60, bottom: 50, left: 60};
const size = 25;
const padding = 1;
// set the inner size of chart
const innerWidth = width - margin.right - margin.left;
const innerHeight = height - margin.top - margin.bottom;

let svg = d3.select('#my_theme_river')
    .append('svg')
        .attr('width', width)
        .attr('height', height)
let plotG = svg
    .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

// input data
// from d3 version5, promise returned from d3.csv()
let csv_data = d3.csv("http://vis.lab.djosix.com:2023/data/air-pollution.csv");
let poll_type = ['SO2', 'NO2', 'O3', 'CO', 'PM10', 'PM2.5'];
let station_list = [];
let timeslot = [];
let dataset = [];

csv_data.then((data) => {
    data_map = d3.rollup(data, function(time){
            // console.log(time.length)
            return {
                'SO2': time.reduce((total, next) => total + Number(next['SO2']), 0) / time.length,
                'NO2': time.reduce((total, next) => total + Number(next['NO2']), 0)  / time.length,
                'O3': time.reduce((total, next) => total + Number(next['O3']), 0)  / time.length,
                'CO': time.reduce((total, next) => total + Number(next['CO']), 0)  / time.length,
                'PM10': time.reduce((total, next) => total + Number(next['PM10']), 0)  / time.length,
                'PM2.5': time.reduce((total, next) => total + Number(next['PM2.5']), 0) / time.length
            }
        }
    , d => d['Address'], d => d['Measurement date'].slice(0, -6))
    // console.log(data_map)
    station_list = Array.from(data_map.keys())
    timeslot = Array.from(data_map.get(station_list[0]).keys())
    // console.log(station_list)
    // console.log(timeslot)
    data_map.forEach(function(station_value, station_key){
        station_value.forEach(function(time_value, time_key){
            poll_type.forEach(function(poll){
                let entry = {
                    'station': station_key,
                    'date': time_key,
                    'poll_type': poll,
                    'value': time_value[poll]
                }
                dataset.push(entry);
            })
        })
        
    })
    // console.log(dataset);
    drawPlot(dataset);
});

function drawPlot(dataset){
    console.log(dataset)
    const series = d3.rollup(dataset, (values, i) => d3.sort(values, d => d.date), d => d.station);

    const x = d3.scaleUtc()
        .domain(d3.extent(dataset, d => d.date))
        .range([0, innerWidth])
    plotG.append('g')
        .call(d3.axisTop(x).ticks(innerWidth / 80).tickSizeOuter(0))

    const y = d3.scaleLinear()
        .domain([0, d3.max(dataset, d => d.value)])
        .range([size, size - (size - padding)]);

    const area = d3.area()
        .defined(d => !isNaN(d.value))
        .x((d) => x(d.date))
        .y0(size)
        .y1((d) => y(d.value));

    const uid = `O-${Math.random().toString(16).slice(2)}`;

    const g = plotG.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
          .attr("transform", (d, i) => `translate(0,${i * size + marginTop})`);
    
      // Add a rectangular clipPath and the reference area.
    const defs = g.append("defs");
    defs.append("clipPath")
    //   .attr("id", (_, i) => `${uid}-clip-${i}`)
    .append("rect")
        .attr("y", padding)
        .attr("width", innerWidth)
        .attr("height", size - padding);

    defs.append("path")
    // .attr("id", (_, i) => `${uid}-path-${i}`)
    .attr("d", ([, values]) => area(values));

    // Create a group for each location, in which the reference area will be replicated
    // (with the SVG:use element) for each band, and translated.
    // g.append("g")
    // .attr("clip-path", (_, i) => `url(${new URL(`#${uid}-clip-${i}`, location)})`)
    // .selectAll("use")
    // .data((_ ,i) => new Array(bands).fill(i))
    // .enter().append("use")
    //     // .attr("xlink:href", (i) => `${new URL(`#${uid}-path-${i}`, location)}`)
    //     .attr("fill", (_, i) => "#fee5d9")
    //     .attr("transform", (_, i) => `translate(0,${i * size})`);

    // Add the labels.
    g.append("text")
        .attr("x", 4)
        .attr("y", (size + padding) / 2)
        .attr("dy", "0.35em")
        .text(([name]) => name);

    // Add the horizontal axis.
    plotG.append("g")
    .attr("transform", `translate(0,${margin.top})`)
    .call(d3.axisTop(x).ticks(width / 80).tickSizeOuter(0))
    .call(g => g.selectAll(".tick").filter(d => x(d) < marginLeft || x(d) >= width - marginRight).remove())
    .call(g => g.select(".domain").remove());
}