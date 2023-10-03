// set the size of svg
const width_legend = 200; const height_legend = 70;

let svg_legend = d3.select('#my_legend')
    .append('svg')
        .attr('width', width_legend)
        .attr('height', height_legend)

svg_legend
    .append("rect")
        .attr("x",22)
        .attr("y",10)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#40a832")
svg_legend
    .append("rect")
        .attr("x",22)
        .attr("y",35)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#21908dff")
svg_legend
    .append("rect")
        .attr("x",22)
        .attr("y",60)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#a83242")
svg_legend
    .append("text")
        .attr("x", 50)
        .attr("y", 15)
        .text("Iris-setosa")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 50)
        .attr("y", 40)
        .text("Iris-versicolor")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 50)
        .attr("y", 65)
        .text("Iris-virginica")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")