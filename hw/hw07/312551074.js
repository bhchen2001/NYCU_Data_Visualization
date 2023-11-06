// set the size of svg
const width = 1080; const height = 15500;
const margin = {top: 10, right: 60, bottom: 50, left: 200};
const size = 100;
const padding = 1;
const bands = 1;
// set the inner size of chart
const innerWidth = width - margin.right - margin.left;
const innerHeight = height - margin.top - margin.bottom;

let svg = d3.select('#my_horizon_chart')
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
// let timeslot = [];
let dataset_2017 = [];
let dataset_2018 = [];
let dataset_2019 = [];
let new_data = []
const poll_color = d3.scaleOrdinal()
    .domain(poll_type)
    .range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#eb07c1"]);

csv_data.then((original_data) => {
    // replace the -1.0 with 0
    original_data.forEach(function(d){
        if(d['SO2'] === '-1.0') d['SO2'] = '0';
        if(d['NO2'] === '-1.0') d['NO2'] = '0';
        if(d['O3'] === '-1.0') d['O3'] = '0';
        if(d['CO'] === '-1.0') d['CO'] = '0';
        if(d['PM10'] === '-1.0') d['PM10'] = '0';
        if(d['PM2.5'] === '-1.0') d['PM2.5'] = '0';
        new_data.push(d);
    });
    data_map = d3.rollup(new_data, function(time){
            // console.log(time)
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
    // timeslot = Array.from(data_map.get(station_list[0]).keys())
    // console.log(station_list)
    // console.log(timeslot)
    data_map.forEach(function(station_value, station_key){
        station_value.forEach(function(time_value, time_key){
            poll_type.forEach(function(poll){
                let entry = {
                    'station': station_key,
                    'date': new Date(time_key.slice(0, 4), +(time_key.slice(5, 7)) - 1, time_key.slice(8,)),
                    'poll_type': poll,
                    'value': time_value[poll]
                }
                if(time_key.slice(0, 4) === '2017') dataset_2017.push(entry);
                if(time_key.slice(0, 4) === '2018') dataset_2018.push(entry);
                if(time_key.slice(0, 4) === '2019') dataset_2019.push(entry);
            })
            // timeslot.push(new Date(time_key.slice(0, 4), +(time_key.slice(5, 7)) - 1, time_key.slice(8,)))
        })
        
    })
    // console.log(dataset);
    drawPlot(dataset_2017, 2017);
});

let select_year = document.querySelector('#yearChoice');
select_year.addEventListener('change', function(){
    let year = document.getElementById('yearChoice').value;
    if(year === '2017') drawPlot(dataset_2017, 2017);
    if(year === '2018') drawPlot(dataset_2018, 2018);
    if(year === '2019') drawPlot(dataset_2019, 2019);
});

function drawPlot(dataset, year){

    plotG.selectAll("*").remove();

    var timeFormat = d3.timeFormat("%Y-%m-%d");
    var interval = 0;
    console.log(dataset)
    const station_series = d3.rollup(dataset, (values, i) => d3.sort(values, d => d.date), d => d.station);
    let timeslot = [];
    if(year === 2017) timeslot = [new Date(2017, 0, 1), new Date(2017, 11, 31)];
    if(year === 2018) timeslot = [new Date(2018, 0, 1), new Date(2018, 11, 31)];
    if(year === 2019) timeslot = [new Date(2019, 0, 1), new Date(2019, 11, 31)];

    const x = d3.scaleTime([])
                .domain(d3.extent(timeslot, function(d) {return d;}))
                .range([0, innerWidth]);
    plotG.append("g")
            .attr("transform", `translate(0,${margin.top})`)
            .call(d3.axisTop(x).ticks(width / 80).tickFormat(timeFormat))

    for (const [station_key, station_value] of station_series.entries()) {
        console.log(station_key);
        const poll_series = d3.rollup(station_value, (values, i) => d3.sort(values, d => d.date), d => d.poll_type);
        for(const [poll_key, poll_value] of poll_series.entries()){
            // console.log(poll_key, poll_value);

            const y = d3.scaleLinear()
                        .domain(d3.extent(poll_value, function(d) {return d.value;}))
                        .range([size - 20, 0]);
            plotG.append("g")
                .attr("transform", `translate(${0}, ${margin.top + size*interval + 20})`)
                .call(d3.axisLeft(y).ticks(4).tickFormat(d3.format(".2f")));
            plotG.append("path")
                .datum(poll_value)
                .attr("transform", `translate(${0}, ${margin.top + size*interval + 20})`)
                .attr("fill", poll_color(poll_key))
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 1.5)
                .attr('opacity', 0.7)
                .attr("d", d3.area()
                  .x(d => x(d.date))
                  .y0(y(0))
                  .y1(d => y(d.value))
                )
            plotG.append("text")
                .attr("transform", `translate(${-200}, ${margin.top + size*interval + 20})`)
                .attr("x", 0)
                .attr("y", (size + padding) / 2 - 7)
                .attr("dy", "0.35em")
                .text(poll_key);
            plotG.append("text")
                .attr("transform", `translate(${-200}, ${margin.top + size*interval + 20})`)
                .attr("x", 0)
                .attr("y", (size + padding) / 2 + 7)
                .attr("dy", "0.35em")
                .text(station_key.split(',')[2]);
            interval += 1;
        }
    }

    // const x = d3.scaleTime([])
    //     .domain(d3.extent(timeslot, function(d) {return d;}))
    //     .range([0, innerWidth]);

    // const y = d3.scaleLinear()
    //     .domain([0, d3.max(dataset, d => d.value)])
    //     .range([size, size - bands * (size - padding)]);

    // const area = d3.area()
    //     .x((d) => x(d.date))
    //     .y0(y(0))
    //     .y1((d) => y(d.value));

    // const uid = `O-${Math.random().toString(16).slice(2)}`;

    // const g = plotG.append("g")
    //     .selectAll("g")
    //     .data(series)
    //     .join("g")
    //       .attr("transform", (d, i) => `translate(0,${i * size + margin.top})`);
    
    // Add a rectangular clipPath and the reference area.
    // const defs = g.append("defs");
    // defs.append("clipPath")
    //     .attr("id", (_, i) => `${uid}-clip-${i}`)
    //         .append("rect")
    //             .attr("y", padding)
    //             .attr("width", innerWidth)
    //             .attr("height", size - padding);

    // defs.append("path")
    //     .attr("id", (_, i) => `${uid}-path-${i}`)
    //     .attr("d", ([, values]) => area(values));

    // g.append("g")
    //     .attr("clip-path", (_, i) => `url(${new URL(`#${uid}-clip-${i}`, location)})`)
    //     .selectAll("use")
    //     .data((_ ,i) => new Array(bands).fill(i))
    //     .enter().append("use")
    //       .attr("xlink:href", (i) => `${new URL(`#${uid}-path-${i}`, location)}`)
    //       .attr("fill", "#ffffff")
    //       .attr("transform", (_, i) => `translate(0,${i * size})`);

    // Add the labels.
    // g.append("text")
    //     .attr("x", 4)
    //     .attr("y", (size + padding) / 2)
    //     .attr("dy", "0.35em")
    //     .text(([name]) => name);

    // Add the horizontal axis.
    // plotG.append("g")
    //     .attr("transform", `translate(0,${margin.top})`)
    //     .attr("transform", `translate(0,${margin.top})`)
    //     .call(d3.axisTop(x).ticks(width / 80).tickSizeOuter(0))
    //     .call(g => g.selectAll(".tick").filter(d => x(d) < margin.left || x(d) >= width - margin.right).remove());

}