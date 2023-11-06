// set the size of svg
const width = 1080; const height = 1000;
const margin = {top: 10, right: 60, bottom: 50, left: 60};
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
let csv_data = d3.csv("http://vis.lab.djosix.com:2023/data/ma_lga_12345.csv");
let prop_type = ['house_2', 'house_3', 'house_4', 'house_5', 'unit_1', 'unit_2', 'unit_3'];
let timeslot = [];
let dataset = [];

csv_data.then((data) => {
    // console.log(data)
    // get all time slot
    let pre_dataset = [];
    data.forEach(function(row){
        tmp_entry = {};
        let saledate = new Date(+row["saledate"].slice(-4), +(row["saledate"].slice(3, 5)) + 1, row["saledate"].slice(0, 2))
        // let saledate = row["saledate"].slice(-4) + row["saledate"].slice(3, 5) 
        //              + row["saledate"].slice(0, 2);
        // saledate = saledate
        tmp_entry["saledate"] = saledate;
        tmp_entry["MA"] = +row["MA"];
        tmp_entry["prop_type"] = row["type"] + '_' + row['bedrooms'];
        pre_dataset.push(tmp_entry);
        tmp = timeslot.find(function(element){
            return Math.abs(element - saledate) === 0;
        })
        if(tmp === undefined) timeslot.push(saledate);
    })
    timeslot = timeslot.sort(function(a, b){
        return a - b;
    })
    console.log(timeslot);
    // console.log(pre_dataset);
    // for each timeslot, create a object for median price of all prop type
    // tmp_entry = {};
    timeslot.forEach(function(t_element){
        tmp_entry = {};
        tmp_entry["saledate"] = t_element;
        prop_type.forEach(function(p_element){
            tmp_entry[p_element] = NaN;
            target_obj = pre_dataset.filter(function(obj){
                return Math.abs(obj.saledate - t_element) === 0 && (obj.prop_type === p_element);
            })
            if(target_obj.length > 0){
                // console.log(target_obj);
                tmp_entry[p_element] = target_obj.map(x => x.MA)[0];
            }
        })
        checkNan = Object.values(tmp_entry).includes(NaN);
        if (checkNan === false) dataset.push(tmp_entry);
    })
    // console.log(dataset);
    timeslot = [];
    dataset.forEach(function(row){
        timeslot.push(row.saledate)
    })
    // console.log(timeslot);
    drawPlot(dataset);
})

function drawPlot(dataset){

    var timeFormat = d3.timeFormat("%Y-%m-%d");

    // Add X axis
    const x = d3.scaleTime([])
        .domain(d3.extent(dataset, function(d) { return d.saledate; }))
        .range([ 0, innerWidth ]);

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([-2500000, 2500000])
        .range([ innerHeight, 0 ]);

    // color palette
    const color = d3.scaleOrdinal()
        .domain(prop_type)
        .range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628'])

    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "chart")
        .attr("class", "tooltip");

    // tooltip events
    const mouseover = function (d) {
        tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("opacity", .4)
    }
    const mousemove = function (event, d) {
        // console.log(d)
        date = x.invert(event.pageX);
        tmp = timeslot
        // console.log(tmp)
        tmp.sort(function(a, b) {
            var distancea = Math.abs(date - a);
            var distanceb = Math.abs(date - b);
            return distancea - distanceb; // sort a before b when the distance is smaller
        });
        // get the original data of same school
        obj = dataset.filter(function(row){
            // console.log(row);
            return row.saledate === tmp[1];
        })
        var type = d.key.slice(0, -2) + " with " + d.key.slice(-1) + " bathroom"
        // console.log(obj);
        tooltip
            .html("Date:" + timeFormat(obj[0]["saledate"]) + 
            "<br><br>Price: $" + (obj[0][d.key]) + "<br><br>Property: " + type)
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 30 + "px");
    }
    const mouseleave = function (d) {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("opacity", 1)
    }

    var stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(prop_type)
        (dataset)

    console.log(stackedData)

    var dragHandler = d3.drag()
        // avoid to use 'select(this)' with es6
        .on('drag', function(event, d){
            var swapArrayElements = function(arr, indexA, indexB) {
                var temp = arr[indexA];
                arr[indexA] = arr[indexB];
                arr[indexB] = temp;
            };
            var index = stackedData.findIndex(function(item){
                return item.key === d.key;
            })
            // get the updated position of axis
            console.log(y.invert(event.y))
            if(index - 1 >= 0){
                var max = d3.max(stackedData[index-1].map(function(array) {
                    return d3.max(array);
                }));
            }
            else{
                var max = NaN;
            }
            if(index + 1 < 7){
                var min = d3.min(stackedData[index+1].map(function(array) {
                    return d3.min(array);
                }));
            }
            else{
                var min = NaN;
            }
            // console.log(max);
            // console.log(min);
            console.log(index)
            if(y.invert(event.y) < max){
                swapArrayElements(prop_type, index, index - 1);
            }
            if(y.invert(event.y) > min){
                swapArrayElements(prop_type, index, index + 1);
            }
            console.log(prop_type);
            stackedData = d3.stack()
                .offset(d3.stackOffsetSilhouette)
                .keys(prop_type)
                (dataset)
            render();
            

            // plotG
            //     .selectAll("mylayers")
            //     .data(stackedData)
            //     .join("path")
            //     .style("fill", function(d) { return color(d.key); })
            //     .attr("d", d3.area()
            //         .x(function(d, i) { return x(d.data.saledate); })
            //         .y0(function(d) { return y(d[0]); })
            //         .y1(function(d) { return y(d[1]); })
            //     )
            //     .on("mouseover", mouseover)
            //     .on("mousemove", mousemove)
            //     .on("mouseleave", mouseleave)
            //     .call(dragHandler);

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

    // const area = d3.area()
    //     .x(function(d, i) { return x(d.data.saledate); })
    //     .y0(function(d) { return y(d[0]); })
    //     .y1(function(d) { return y(d[1]); })
    
    // // Add a group for each stream
    // const streams = plotG.selectAll("mylayers")
    //     .data(stackedData)
    //     .enter()
    //     .append("g")
    //     .attr("class", "stream");
    
    // streams.append("path")
    //     .attr("fill", function(d) { return color(d.key); })
    //     .attr("d", d => area(d))
    //     .on("mouseover", mouseover)
    //     .on("mousemove", mousemove)
    //     .on("mouseleave", mouseleave)
    //     .call(dragHandler);
    
    // Add a draggable functionality to reorder the streams
    // streams.call(d3.drag()
    //     .on("start", dragStarted)
    //     .on("drag", dragged)
    //     .on("end", dragEnded));

    // Show the areas
    function render(){
        plotG.selectAll("*").remove();
        plotG.append("g")
            .call(d3.axisLeft(y));
        plotG.append("g")
            .attr("transform", `translate(0, ${innerHeight})`)
            .call(d3.axisBottom(x).ticks(5).tickFormat(timeFormat));
        plotG
            .selectAll("mylayers")
            .data(stackedData)
            .join("path")
            .style("fill", function(d) { return color(d.key); })
            .attr("d", d3.area()
                .x(function(d, i) { return x(d.data.saledate); })
                .y0(function(d) { return y(d[0]); })
                .y1(function(d) { return y(d[1]); })
            )
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
            .call(dragHandler);
    }
    render();

    // plotG
    //     .select("mylayers")
        
}