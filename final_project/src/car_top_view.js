
const car_position = ['left', 'front', 'back', 'front_right', 'front_left', 'right', 'left_back', 'top', 'right_back']
const car_position_chinese = ['車輛左側', '車頭', '車尾', '車頭右側', '車頭左側', '車輛右側', '車尾左側', '車頂', '車尾右側'];

function drawCarTopView(start_month, end_month){
    /* read the csv file */
    d3.csv("../dataset/A2_car_hit.csv").then(function(data){
        /* format the Date_ID */
        var parseDate = d3.timeParse("%Y%m%d");
        data.forEach(function(d) {
            d.Date_ID = parseDate(d.Date_ID);
        });
        // console.log(data);
        /* keep valid rows */
        data = data.filter(function(d) {
            return d.Date_ID.getMonth() + 1 >= start_month && d.Date_ID.getMonth() + 1 <= end_month;
        });
        /* count the number of different car hit positions */
        var count = [];
        for (var i = 0; i < car_position.length; i++) {
            count.push({
                position: car_position[i],
                value: 0
            });
        }
        data.forEach(function(d) {
            count.forEach(function(c) {
                if (d.car_hit == c.position) {
                    c.value++;
                }
            });
        });
        renderCarTopView(count);
    });
}

function renderCarTopView(accident_data){

    /* remove the previous svg and tooltip */
    d3.select("#car").select("svg").remove();
    d3.select("#car").select(".tooltip").remove();


    /* read the svg file and plot the car */
    d3.xml("../dataset/Ford Fiesta 2017 Outline 01.svg").then(function(car_data){
        d3.select("#car").node().append(car_data.documentElement);
        
        /* change the size of the car */
        d3.select("#car")
            .select("svg")
            .attr("width", 450)
            .attr("height", 600)
            // .attr("transform", "rotate(90)")
            .attr("transform", "translate(0, -90) rotate(90) scale(1.2)")
            .attr("viewBox", "0 -200 1000 1000");

        // console.log(accident_data);

        var myColor = d3.scaleLinear()
            .range(["#ffb374", "#e31a1c"])
            .domain([0, d3.max(accident_data, function(d) { return d.value; })]);

        var tooltip = d3.select("#car")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "rgba(0, 0, 0, 0.7)");

        function mouseover(event, d) {
            const [x_mouse, y_mouse] = d3.pointer(event);

            d3.select(this)
                .style("stroke-width", 3)
                .style("opacity", 1);

            tooltip
                .style("opacity", 1);
        };

        function mousemove(event, d) {
            const [x_mouse, y_mouse] = d3.pointer(event);

            c = d3.select(this).attr('class');
            // console.log(c);

            tooltip
                .html("類別: " + car_position_chinese[car_position.indexOf(c)] + "<br>人數: " + accident_data[car_position.indexOf(c)].value)
                .style("color", "white")
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY + 10 + "px");
        };

        function mouseleave(event, d) {
            d3.select(this)
                .style("stroke-width", 1)
                .style("opacity", 0.8);

            tooltip
                .style("opacity", 0);
        };

        /* plot the car hit positions according to the accident data */
        accident_data.forEach(function(d){
            d3.select("#car")
                // .select("svg")
                .selectAll("path." + d.position)
                .style("fill", myColor(d.value))
                .style("opacity", 0)
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave);
        });

        /* add transition */
        d3.select("#car")
            .select("svg")
            .selectAll("path")
            .transition()
            .duration(transition_time)
            .style("opacity", 0.8);
    });
}