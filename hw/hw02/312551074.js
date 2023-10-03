// set the size of svg
const width = 1080; const height = 720;
const margin = {top: 10, right: 60, bottom: 50, left: 60};
// set the inner size of chart
const innerWidth = width - margin.right - margin.left;
const innerHeight = height - margin.top - margin.bottom;

var durationTime = 500;

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
    // console.log(dataset);
    data = dataset;
    drawPlot(data);
})

function drawPlot(dataset){
    const plotG = svg
        .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
    // fetch the name of each attribute / y axis
    const attriName = Object.keys(data[0]).slice(0, 4);
    // console.log(attriName);

    // color scale
    const color = d3.scaleOrdinal()
        .domain([
            'Iris-setosa',
            'Iris-versicolor',
            'Iris-virginica'
        ])
        .range(['#40a832', '#21908dff', '#a83242']);

    // x axis
    let xScale = d3.scalePoint()
        .domain(attriName)
        .range([10, innerWidth]);
    //y axis
    // y axis array
    var yScale = [];
    var yAxisPos = [];
    attriName.forEach(name => {
        yScale[name] = d3.scaleLinear()
            .domain([0, 8])
            .range([innerHeight, 40]);

        yAxisPos[name] = xScale(name);
    });

    //draw line function
    let dragPos = yAxisPos;
    function renderLine(inst){
        return d3.line()(attriName.map(function(attr) {return [yAxisPos[attr], yScale[attr](inst[attr])]; }));
    }
    const plotLines = plotG.selectAll('lines')
                        .data(dataset)
                        .enter()
                        .append('path');
    plotLines
        .attr("class", function(d) { return d.class + "line"})
        .attr('d', renderLine)
        .style('fill', 'none')
        .style('stroke', function(inst) {return color(inst.class)})
        .style('opacity', 0.5);
    // drag handler
    var dragHandler = d3.drag()
        // avoid to use 'select(this)' with es6
        .on('drag', function(event){
            // get the updated position of axis
            dragPos[d3.select(this).data()] = event.x;
            // console.log(dragPos[d3.select(this).data()]);
            // console.log(dragPos);
            // rearrange order
            attriName.sort((a, b) => {
                return dragPos[a] - dragPos[b];
            })
            xScale.domain(attriName);
            attriName.forEach(name => {
                dragPos[name] = xScale(name);
            })
            dragPos[d3.select(this).data()] = event.x;
            // render the line
            plotLines.attr('d', renderLine);
            // move the axis
            d3.selectAll('.dragAxes')
                .attr('transform', function(d) { 
                    return "translate(" + dragPos[d] + ")";
                });
        })
        // .on('end', function(event) {
        //     attriName.forEach(name => {
        //         dragPos[name] = xScale(name);
        //     });
        //     plotLines
        //         .transition()
        //         .duration(durationTime)
        //         .attr('d', renderLine);
        //     d3.select(this)
        //         .transition()
        //         .duration(durationTime)
        //         .attr('transform', "translate(" + xScale(d3.select(this).data()) + ")");
        // })
    // draw axis
    const yAxis = plotG.selectAll('axis').data(attriName)
    yAxis
        .enter()
        .append('g')
            .attr('class', 'dragAxes')
            .attr('transform', function(name) { 
                return "translate(" + xScale(name) + ")";
            })
            .call(dragHandler)
        .append('g')
            .each(function(name) {
                d3.select(this)
                    .call(d3.axisLeft().scale(yScale[name]));
            })
        .append('text')
            .attr('class', 'yAxisLabel')
            .text(function(name) {return name;})
            .attr('y', 10)
            .attr('fill', 'black'); 
}