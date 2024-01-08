
const heatGroups = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const heatVars = ["0-4", "4-8", "8-12", "12-16", "16-20", "20-24"];

function drawHeatmap(start_month, end_month, data){

        // console.log(data);
        // /* format the Date_ID */
        // var parseDate = d3.timeParse("%Y%m%d%H%M%S");
        // data.forEach(function(d) {
        //     d.Date_ID = parseDate(d.Date_ID);
        // });
        // console.log(data);
        // /* keep valid rows */
        // data = data.filter(function(d) {
        //     return d.Date_ID.getMonth() + 1 >= start_month && d.Date_ID.getMonth() + 1 <= end_month;
        // });
        /* drop other columns */
        data = data.map(function(d) {
            return {
                weekday: heatGroups[d.Date_ID.getDay()],
                /* split hours into 6 groups
                 * 0: 0-4
                 * 1: 4-8
                 * 2: 8-12
                 * 3: 12-16
                 * 4: 16-20
                 * 5: 20-24
                 */
                timeslot: heatVars[Math.floor(d.Date_ID.getHours() / 4)]
            };
        });
        /* count the number of people in each timeslot of each weekday */
        var count = [];
        for (var i = 0; i < heatGroups.length; i++) {
            for (var j = 0; j < heatVars.length; j++) {
                count.push({
                    weekday: heatGroups[i],
                    timeslot: heatVars[j],
                    value: 0
                });
            }
        }
        data.forEach(function(d) {
            count.forEach(function(c) {
                if (d.weekday == c.weekday && d.timeslot == c.timeslot) {
                    c.value++;
                }
            });
        });
        renderHeatmap(count);
}

function renderHeatmap(count){
    /* remove the previous svg and tooltip */
    d3.select("#heatmap").select("svg").remove();
    d3.select("#heatmap").select(".tooltip").remove();

    /* set the dimensions and margins of the graph */
    var margin = { top: 30, right: 30, bottom: 30, left: 100 },
        width = 650 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    /* append the svg object to the body of the page */
    var svg = d3.select("#heatmap")
        .append("svg")
        .attr("width", width + margin.left + margin.right + 100)
        .attr("height", height + margin.top + margin.bottom + 100)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    /* Labels of row and columns */
    let yLabels = ["12am - 4am", "4am - 8am", "8am - 12pm", "12pm - 4pm", "4pm - 8pm", "8pm - 12am"];

    /* padding between rect */
    let padding = 0;

    /* Build X scales and axis: */
    var x = d3.scaleBand()
        .range([0, width])
        .domain(heatGroups)
        .padding(padding);
    svg.append("g")
        .style("font-size", 15)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .select(".domain").remove();

    /* Build Y scales and axis */
    var y = d3.scaleBand()
        .range([0, height])
        .domain(heatVars)
        .padding(padding);
    svg.append("g")
        .style("font-size", 15)
        .call(d3.axisLeft(y).tickSize(0).tickFormat(function(d) { return yLabels[heatVars.indexOf(d)];}))
        .select(".domain").remove();

    svg.selectAll(".tick text")
        .style("opacity", 0);

    svg.selectAll(".tick text")
        .transition()
        .duration(transition_time)
        .style("opacity", 1);

    /* Build color scale */
    var myColor = d3.scaleLinear()
        .range(["white", "#e31a1c"])
        .domain([0, d3.max(count, function(d) { return d.value; })]);

    /* create a tooltip */
    var tooltip = d3.select("#heatmap")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "rgba(0, 0, 0, 0.7)");

    /* Three function that change the tooltip when user hover / move / leave a cell */
    var mouseover = function(d) {
        d3.select(this)
            .style("stroke-width", 3)
            .style("opacity", 1);
        tooltip
            .style("opacity", 1);
    };
    var mousemove = function(event, d) {
        tooltip
            .style("color", "white")
            .html("時間: " + d.timeslot + "<br>星期: " + d.weekday + "<br>案例: " + d.value)
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY + 10 + "px");
    };
    var mouseleave = function(d) {
        d3.select(this)
            .style("stroke-width", 1)
            .style("opacity", 0.8);
        tooltip
            .style("opacity", 0);
    };

    /* add the squares */
    heatmapPlot = svg.selectAll()
        .data(count, function(d) { return d.weekday + ':' + d.timeslot; })
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.weekday) })
        .attr("y", function(d) { return y(d.timeslot) })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth())
        .style("opacity", 0);

    heatmapPlot
        .transition()
        .duration(transition_time)
        .style("fill", function(d) { return myColor(d.value) })
        .style("stroke-width", 1)
        .style("stroke", "#000000")
        .style("opacity", 0.8);

    heatmapPlot
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    /* add the legend */
    var legend = svg
        .selectAll(".legend")
        .data(myColor.ticks(6).slice(1).reverse())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
            return "translate(800," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("width", 20)
        .attr("height", 20)
        .style("opacity", 0);

    legend.selectAll("rect")
        .transition()
        .duration(transition_time)
        .style("opacity", 0.8)
        .style("fill", myColor);

    legend.append("text")
        .attr("x", 26)
        .attr("y", 10)
        .attr("dy", ".35em")
        .text(String)
        .style("opacity", 0);

    legend.selectAll("text")
        .transition()
        .duration(transition_time)
        .style("opacity", 0.8);

    /* add the title */
    svg.append("text")
        .attr("x", (width / 2))
        .attr("y", height + 60)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Heatmap of the number of people in each timeslot of each weekday");

    svg.selectAll("text")
        .style("opacity", 0)
        .transition()
        .duration(transition_time)
        .style("opacity", 0.8);

    // /* add the x-axis label */
    // svg.append("text")
    //     .attr("x", (width / 2))
    //     .attr("y", height + 60)
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "16px")
    //     .text("Weekday");

    // /* add the y-axis label */
    // svg.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 0 - margin.left + 20)
    //     .attr("x", 0 - (height / 2))
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "16px")
    //     .text("Timeslot");
}