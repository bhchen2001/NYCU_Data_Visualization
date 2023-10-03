// set the size of svg
const width_legend = 200; const height_legend = 70;

let svg_legend = d3.select('#my_legend')
    .append('svg')
        .attr('width', width_legend)
        .attr('height', height_legend)

svg_legend
    .append("circle")
        .attr("cx",30)
        .attr("cy",10)
        .attr("r", 6)
        .style("fill", "#40a832")
svg_legend
    .append("circle")
        .attr("cx",30)
        .attr("cy",35)
        .attr("r", 6)
        .style("fill", "#21908dff")
svg_legend
    .append("circle")
        .attr("cx",30)
        .attr("cy",60)
        .attr("r", 6)
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