// set the size of svg
const width = 1080; const height = 1000;
const margin = {top: 10, right: 60, bottom: 50, left: 60};
// set the inner size of chart
const innerWidth = width - margin.right - margin.left;
const innerHeight = height - margin.top - margin.bottom;

var durationTime = 500;

let svg = d3.select('#my_brushable_scatter_plot')
    .append('svg')
        .attr('width', width)
        .attr('height', height)
let plotG = svg
    .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

// input data
// from d3 version5, promise returned from d3.csv()
let csv_data = d3.csv("http://vis.lab.djosix.com:2023/data/iris.csv");
let data = [];

var cell_width = 500,
    cell_size = 200,
    padding = 30;

var x = d3.scaleLinear()
    .range([padding / 2, cell_size - padding / 2]);

var y = d3.scaleLinear()
    .range([cell_size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom(x)
    .ticks(6);

var yAxis = d3.axisLeft(y)
    .ticks(6);

let color = d3.scaleOrdinal()
    .domain([
        'Iris-setosa',
        'Iris-versicolor',
        'Iris-virginica'
    ])
    .range(['#40a832', '#21908dff', '#a83242']);

// csv_data: Promise {<state>: 'pending}
// dataset: Array(151)
csv_data.then((dataset) =>{
    dataset.pop()
    dataset.forEach((element) => {
        element['sepal length'] = +element['sepal length'];
        element['sepal width'] = +element['sepal width'];
        element['petal length'] = +element['petal length'];
        element['petal width'] = +element['petal width'];
    });
    // console.log(dataset);
    data = dataset;
    drawPlot(data);
})

function drawPlot(dataset){

    var domainByTrait = {};
    var traits = Object.keys(dataset[0]).filter(function(d) { return d !== "class"; });
    var n = traits.length;

    traits.forEach(function(trait) {
        domainByTrait[trait] = d3.extent(data, function(d) { return +d[trait]; });
    });

    xAxis.tickSize(cell_size * n);
    yAxis.tickSize(-cell_size * n);

    var brush = d3.brush()
      .on("start", brushstart)
      .on("brush", brushmove)
      .on("end", brushend)
      .extent([[0,0],[cell_size,cell_size]]);


    plotG.selectAll(".x.axis")
        .data(traits)
        .enter().append("g")
            .attr("class", "x axis")
            .attr("transform", function(d, i) { return "translate(" + (n - i - 1) * cell_size + ",0)"; })
            .each(function(d) { x.domain(domainByTrait[d]); d3.select(this).call(xAxis); });

    plotG.selectAll(".y.axis")
        .data(traits)
        .enter().append("g")
            .attr("class", "y axis")
            .attr("transform", function(d, i) { return "translate(0," + i * cell_size + ")"; })
            .each(function(d) { y.domain(domainByTrait[d]); d3.select(this).call(yAxis); });

    var cell = plotG.selectAll(".cell")
        .data(cross(traits, traits))
        .enter().append("g")
            .attr("class", "cell")
            .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * cell_size + "," + d.j * cell_size + ")"; })
            .each(plot);

    // Titles for the diagonal.
    diagonal = cell.filter(function(d) { return d.i === d.j; });
    diagonal.select("g").remove()
    diagonal.append("text")
            .attr("x", padding - 20)
            .attr("y", padding - 30)
            .attr("dy", ".71em")
            .attr('fill', 'black')
            .text(function(d) { return d.x; });

    cell.call(brush);

    function plot(p) {
        var cell = d3.select(this);

        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);

        // plot the diagonal
        if(p.x === p.y){

            xextent = d3.extent(data, function(d) { return +d[p.x] })
            const x_tmp = d3.scaleLinear()
                .domain(xextent).nice()
                .range([ padding / 2, cell_size - padding / 2 ]);

            const histogram = d3.histogram()
                .value(function(d) { return +d[p.x]; })
                .domain(x_tmp.domain()) 
                .thresholds(x_tmp.ticks(15));

            const bins = histogram(dataset);

            const y_tmp = d3.scaleLinear()
                .range([cell_size - padding / 2, padding / 2])
                .domain([0, d3.max(bins, function(d) { return d.length; })]);

            cell.selectAll("rect")
                .data(bins)
                .join("rect")
                    .attr("x", 1)
                    .attr("transform", function(d){
                        return `translate(${x_tmp(d.x0)},${y_tmp(d.length)})`;
                    })
                    .attr("width", function(d) { return x_tmp(d.x1) - x_tmp(d.x0)  ; })
                    .attr("height", function(d) { return (cell_size - padding / 2) - y_tmp(d.length); })
                    .style("fill", "#b8b8b8")
                    .attr("stroke", "black")

            cell.append("rect")
                .attr("class", "frame")
                .attr("x", padding / 2)
                .attr("y", padding / 2)
                .attr("width", cell_size - padding)
                .attr("height", cell_size - padding);
                
            return;
        }

        cell.append("rect")
            .attr("class", "frame")
            .attr("x", padding / 2)
            .attr("y", padding / 2)
            .attr("width", cell_size - padding)
            .attr("height", cell_size - padding);

        cell.selectAll("circle")
            .data(data)
            .enter().append("circle")
                .attr("cx", function(d) { return x(d[p.x]); })
                .attr("cy", function(d) { return y(d[p.y]); })
                .attr("r", 4)
                .style("fill", function(d) { return color(d.class); });
    }

    var brushCell;

    // Clear the previously-active brush, if any.
    function brushstart(event, p) {
        if (brushCell !== this) {
            d3.select(brushCell).call(brush.move, null);
            x.domain(domainByTrait[p.x]);
            y.domain(domainByTrait[p.y]);
            brushCell = this;
        }
    }

    // Highlight the selected circles.
    function brushmove(event, p) {
        var e = d3.brushSelection(this);
        if (!e) {
            plotG.selectAll("circle").classed("hidden", false);
        } 
        else {
            plotG.selectAll("circle").classed("hidden", function(d) {
                return e[0][0] > x(d[p.x]) || x(d[p.x]) > e[1][0]
                    || e[0][1] > y(d[p.y]) || y(d[p.y]) > e[1][1];
            });
        }
    }

    // If the brush is empty, select all circles.
    function brushend(event) {
        if (event.selection === null) svg.selectAll(".hidden").classed("hidden", false);
    }
}

function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = n; i--; i>0) for (j = -1; ++j < m;) c.push({x: a[i], i: i, y: b[j], j: j});
    return c;
}