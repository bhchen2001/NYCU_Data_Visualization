// set the size of svg
const width = 1080; const height = 720;
const margin = {top: 10, right: 30, bottom: 50, left: 60};
// set the inner size of chart
const innerWidth = width - margin.right - margin.left;
const innerHeight = height - margin.top - margin.bottom;

let svg = d3.select('#my_scatter_plot')
    .append('svg')
        .attr('width', width)
        .attr('height', height)
svg
    .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

// input data
// from d3 version5, promise returned from d3.csv()
let csv_data = d3.csv("http://vis.lab.djosix.com:2023/data/iris.csv");
let data = [];
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
    console.log(dataset);
    data = dataset;
    drawPlot(data);
})

var select_x = document.querySelector("#xAxisChoice");
select_x.addEventListener('change', (event) => {
    drawPlot(data);
});

var select_y = document.querySelector("#yAxisChoice");
select_y.addEventListener('change', (event) => {
    drawPlot(data);
});

function drawPlot(dataset){
    svg.selectAll('g').remove();
    const circleRadius = 10;
    var xAxisLabel = document.getElementById("xAxisChoice").value;
    var yAxisLabel = document.getElementById("yAxisChoice").value;
    // console.log(dataset);
    const plotG = svg
        .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
    // x_axis
    const xValue = (dataset) => dataset[xAxisLabel];
    const xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, xValue))
        .range([0, innerWidth])
        .nice();
    const xAxis = d3.axisBottom(xScale)
        .tickSize(innerHeight)
        .tickPadding(15);
    const xAxisG = plotG
        .append('g')
            .call(xAxis)
    // xAxisG.selectAll('.domain').remove();

    // x axis label
    xAxisG
        .append('text')
            .attr('class', 'axis_label')
            .attr('y', innerHeight + margin.bottom - 5)
            .attr('x', innerWidth / 2)
            .attr('fill', 'black')
            .text(xAxisLabel);

    // y_axis
    const yValue = (dataset) => dataset[yAxisLabel];
    const yScale = d3.scaleLinear()
        .domain(d3.extent(dataset, yValue))
        .range([innerHeight, 0])
        .nice()
    const yAxis = d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickPadding(10);
    const yAxisG = plotG
        .append('g')
            .call(yAxis);
    // yAxisG.selectAll('.domain').remove()

    // y axis label
    yAxisG
        .append('text')
            .attr('class', 'axis_label')
            .attr('y', -40)
            .attr('x', -innerHeight / 2)
            .attr('fill', 'black')
            .attr('transform', `rotate(-90)`)
            .attr('text-anchor', 'middle')
            .text(yAxisLabel);

    plotG.exit().remove()

    // color scale
    const color = d3.scaleOrdinal()
        .domain([
            'Iris-setosa',
            'Iris-versicolor',
            'Iris-virginica'
        ])
        .range(['#40a832', '#21908dff', '#a83242']);

    // join the data
    let circles = plotG.selectAll('circle').data(dataset)
    circles.exit().remove();
    // plot circle
    circles
        .enter()
        .append('circle')
            .attr('fill', (data) => {return color(data["class"])})
            .attr('cx', (data) => {return xScale(xValue(data))})
            .attr('cy', (data) => {return yScale(yValue(data))})
            .attr('r', circleRadius);
}