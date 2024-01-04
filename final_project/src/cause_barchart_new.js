function cause_bar(dateStart, dateEnd){
    d3.csv("cause_vehicle_A2_time.csv").then(function(data) {

        // convert dateStart and dateEnd to proper format
        let year = "2022";
        let startDate = year + dateStart.toString().padStart(2, '0'); // ex "202201"
        let endDate = year + dateEnd.toString().padStart(2, '0');     // ex "202203"

        // filter Date_ID between startDate and endDate 
        let filteredData = data.filter(record => {
            let dateId = record.Date_ID.substring(0, 6); // 提取日期部分 (年和月)
            return dateId >= startDate && dateId <= endDate;
        });

        // renew data
        data = filteredData;

        // preprocess data to proportion
        const groupedData = {};
        const vehicleTypes = ['全聯結車', '其他車', '半聯結車', '大客車', '大貨車', '小客車', '小貨車(含客、貨兩用)', '慢車', '曳引車', '機車', '特種車']; // 定義所有車種

        data.forEach(record => {
            const cause = record['肇因研判子類別名稱-個別'];
            const vehicleType = record['當事者區分-類別-大類別名稱-車種'];

            if (!groupedData[cause]) {
                groupedData[cause] = {};
                vehicleTypes.forEach(v => groupedData[cause][v] = 0); // initial car type count to 0
            }
            if (vehicleTypes.includes(vehicleType)) {
                groupedData[cause][vehicleType]++;
            }
        });

        // calculate proportion
        const proportionsArray = [];
        Object.keys(groupedData).forEach(cause => {
            const total = Object.values(groupedData[cause]).reduce((a, b) => a + b, 0);
            const causeProportion = { '肇因研判子類別名稱-個別': cause };

            vehicleTypes.forEach(vehicleType => {
                causeProportion[vehicleType] = (groupedData[cause][vehicleType] / total).toFixed(4);
            });

            proportionsArray.push(causeProportion);
        });

        proportionsArray['columns'] = ['肇因研判子類別名稱-個別'].concat(vehicleTypes);     
        data = proportionsArray;


        // create container
        var newDiv = document.createElement("div");
                    newDiv.id = "stack_legend";
                    document.body.appendChild(newDiv);

                    newDiv = document.createElement("div");
                    newDiv.id = "stacked-bar-chart";
                    document.body.appendChild(newDiv);

        const colors=["#7CB342", "#F0F4C3", "#DCE775","#AED581", "#FFC107", "#B71C1C","#F57F17", "#FFEE58", " #fff59d","#880033","#4DB6AC"];


        // Set the dimensions of the canvas / graph
        var margin = {top: 20, right: 40, bottom: 30, left: 200},
            width = 600 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // Set the ranges
        var y = d3.scaleBand().rangeRound([0, height]).padding(0.1),
            x = d3.scaleLinear().rangeRound([0, width]),
            z = d3.scaleOrdinal().range(colors);

        // Append the svg object to the body of the page"#FFC107"
        var svg = d3.select("#stacked-bar-chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", 
                  "translate(" + margin.left + "," + margin.top + ")");

        // Scale the range of the data in the domains
        y.domain(data.map(function(d) { return d['肇因研判子類別名稱-個別']; }));
        x.domain([0, 1]); // Assuming all data adds up to 1 (100%)
        z.domain(data.columns.slice(1));

        // append the rectangles for the bar chart
        data.forEach(function(d) {
            var x0 = 0;
            d.boxes = z.domain().map(function(name) { return {name: name, x0: x0, x1: x0 += +d[name]}; });
             // Sort the boxes based on size
            d.boxes.sort(function(a, b) { return (b.x1 - b.x0) - (a.x1 - a.x0); });

            // Recalculate x0 and x1 values based on the sorted order
            x0 = 0;
            d.boxes.forEach(function(box) {
                var rate = box.x1 - box.x0;
                box.x0 = x0;
                box.x1 = x0 += rate;
            });

        });


        var bars = svg.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("transform", function(d) { return "translate(0," + y(d['肇因研判子類別名稱-個別']) + ")"; });

        bars.selectAll("rect")
            .data(function(d) { return d.boxes; })
            .enter().append("rect")
            .attr("height", y.bandwidth())
            .attr("x", function(d) { return x(d.x0); })
            .attr("width", function(d) { return x(d.x1) - x(d.x0); })
            .style("fill", function(d) { return z(d.name); });
        
        // create mouse event
        bars.selectAll("rect")
                .on("mouseover", function (event, d) {
                    // access mouse position
                    const [x_mouse, y_mouse] = d3.pointer(event);

                    d3.select(this)
                    .attr("stroke", "#222")
                    .attr("stroke-width", 2.5);

                    const rate = d.x1 - d.x0;
                    const tooltip = d3.select("#tooltip");
                    tooltip
                        .style("opacity", 1)
                        .html(`${d.name}: ${((rate*100).toFixed(1))}%`)
                        .style("left", x(d.x1) + "px")
                        .style("top", height+80+ "px");
                    })
                    .on("mouseout", function () {
                        d3.select(this)
                        .attr("stroke", null)
                        .attr("stroke-width", null);

                        d3.select("#tooltip").style("opacity", 0);
                    });

        // create tooltip
        d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #d3d3d3")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("opacity", 0);


        // add the y Axis
        svg.append("g")
            .call(d3.axisLeft(y))
            .selectAll("text")  
            .style("font-size", "15px");

        // add the x Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(10, "%"))
            .selectAll("text")  
            .style("font-size", "14px");
           


        // create legend
        const legendContainer = d3.select("#stack_legend");

        // set color
        const legendData = [
            { className: "機車", color: colors[9] },
            { className: "小客車", color: colors[5] },
            { className: "小貨車", color: colors[6] },
            { className: "大貨車", color: colors[4] },
            { className: "慢車", color: colors[7]},
            { className: "曳引車", color: colors[8] },
            { className: "其他車", color: colors[1] },
            { className: "半聯結車", color: colors[2] },
            { className: "大客車", color: colors[3] },
            { className: "全聯結車", color: colors[0] },
            { className: "特種車", color: colors[10] },
        ];

        // create legend block
        const legendItems = legendContainer.selectAll("div")
            .data(legendData)
            .enter().append("div")
            .style("margin-right", "10px")
            .style("display", "inline-block") 

        // set circles and class names
        legendItems
            .append("span")
            .style("background-color", d => d.color) // color of circles
            .style("width", "12px")
            .style("height", "12px")
            .style("border-radius", "50%")
            .style("display", "inline-block")
            .style("margin-right", "5px");

        legendItems
            .append("span")
            .text(d => d.className); 

     });
    }