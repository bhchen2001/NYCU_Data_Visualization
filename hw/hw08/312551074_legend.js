// set the size of svg
const width_legend = 1500; const height_legend = 30;

let svg_legend = d3.select('#my_legend')
    .append('svg')
        .attr('width', width_legend)
        .attr('height', height_legend)

let y_location = 10

svg_legend
    .append("rect")
        .attr("x",22)
        .attr("y", y_location)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#e41a1c")
svg_legend
    .append("rect")
        .attr("x",160)
        .attr("y", y_location)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#377eb8")
svg_legend
    .append("rect")
        .attr("x",300)
        .attr("y", y_location)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#4daf4a")
svg_legend
    .append("rect")
        .attr("x",450)
        .attr("y",y_location)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#984ea3")
svg_legend
    .append("rect")
        .attr("x", 600)
        .attr("y", y_location)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#ff7f00")
svg_legend
    .append("rect")
        .attr("x", 750)
        .attr("y", y_location)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#eb07c1")
svg_legend
    .append("rect")
        .attr("x", 870)
        .attr("y", y_location)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#000000")

svg_legend
    .append("text")
        .attr("x", 40)
        .attr("y", 18)
        .text("buying price")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 180)
        .attr("y", 18)
        .text("maintenance")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 320)
        .attr("y", 18)
        .text("num of door")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 470)
        .attr("y", 18)
        .text("capacity of person")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 620)
        .attr("y", 18)
        .text("luggage boot size")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 780)
        .attr("y", 18)
        .text("safety")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 890)
        .attr("y", 18)
        .text("class")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")