// set the size of svg
const width_legend = 1000; const height_legend = 30;

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
        .style("fill", "#40a832")
svg_legend
    .append("rect")
        .attr("x",160)
        .attr("y", y_location)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#21908dff")
svg_legend
    .append("rect")
        .attr("x",300)
        .attr("y", y_location)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#a83242")
svg_legend
    .append("rect")
        .attr("x",430)
        .attr("y",y_location)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#ed9542")
svg_legend
    .append("rect")
        .attr("x", 615)
        .attr("y", y_location)
        .attr('width', 15)
        .attr('height', 5)
        .style("fill", "#4d09b3")
svg_legend
    .append("text")
        .attr("x", 40)
        .attr("y", 18)
        .text("scores_teaching")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 180)
        .attr("y", 18)
        .text("scores_research")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 320)
        .attr("y", 18)
        .text("scores_citations")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 450)
        .attr("y", 18)
        .text("scores_industry_income")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")
svg_legend
    .append("text")
        .attr("x", 640)
        .attr("y", 18)
        .text("scores_international_outlook")
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")