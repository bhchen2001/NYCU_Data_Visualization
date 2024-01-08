
function weather_stream(dateStart, dateEnd){
    d3.csv(csv_file_path).then(function(raw_data) {
        /* filter the data with current_county */
        if(current_county != "全台灣"){
            raw_data = raw_data.filter(function(d) {
                return d.發生地點 == current_county;
            });
        }
        // create container
        var newDiv = document.createElement("div");
        newDiv.id = "legend";
        document.body.appendChild(newDiv);

        newDiv = document.createElement("div");
        newDiv.id = "streamchart";
        document.body.appendChild(newDiv);

        // set the dimensions and margins of the graph
        const margin = {top: 20, right: 30, bottom: 30, left: 60},
        width = 1000 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

        /* remove the svg if it exists */
        d3.select("#stream_chart").select("svg").remove();
        d3.select("#stream_chart").select(".tooltip").remove();
        d3.select("#stream_chart").select("div").remove();

        // append the svg object to the body of the page
        const svg = d3.select("#stream_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        // .attr("style", "border: 1px solid #000000;" )
        .append("g")
        .attr("transform",
                `translate(${margin.left}, ${margin.top})`);
    

        var keys = ['晴','陰','雨'];
        var colors = ['#ffc300','#87bfd5','#0b9bf1'];
        let data;

        if (dateEnd - dateStart > 10){
            function aggregateWeatherData(inputData) {
                const result = {};
                
                inputData.forEach(item => {
                    const dateKey = item.Date_ID.substring(0, 6); // 取前6個字元作為日期
                    const weather = item.天候名稱;

                    if (!result[dateKey]) {
                        result[dateKey] = { date: dateKey };
                    }

                    if (!result[dateKey][weather]) {
                        result[dateKey][weather] = 0;
                    }

                    result[dateKey][weather]++;
                });

                return Object.values(result);
            }

            data = aggregateWeatherData(raw_data);

            // parse the date
            var parseDate = d3.timeParse("%Y%m");
            data.forEach(function(d) {
                d.date_standard = parseDate(d.date);
            });
        }

        if (dateEnd - dateStart >= 2 && dateEnd - dateStart <= 10) {

            // Function to get the week number belonging to the date
            function getWeekNumber(dateString) {
                let date = new Date(dateString.substring(0, 4), dateString.substring(4, 6) - 1, dateString.substring(6, 8));
                let firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                let pastDaysOfYear = (date - firstDayOfYear) / 86400000;
                return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            }

            // Function to aggregate data by week
            function aggregateWeatherData(inputData) {
                const result = {};
                
                inputData.forEach(item => {
                    const dateKey = item.Date_ID.substring(0, 8); 
                    const weather = item.天候名稱;
                    const weekNum = getWeekNumber(dateKey);
                    const weekKey = `${dateKey.substring(0, 4)}W${weekNum.toString().padStart(2, '0')}`;
                    // parse the date
                    var parseDate = d3.timeParse("%YW%W");
                    var dateParser = d3.timeFormat("%Y%m%d");
        
                    if (!result[weekKey]) {
                        result[weekKey] = { 
                            date: dateParser(parseDate(weekKey)),
                            date_standard: parseDate(weekKey), 
                            endDate: new Date(parseDate(weekKey).getTime() + 6 * 24 * 60 * 60 * 1000)
                        };
                        keys.forEach(key => result[weekKey][key] = 0); 
                    }
                           
                    result[weekKey][weather]++;
                });

                return Object.values(result);
            }
        
            data = aggregateWeatherData(raw_data);
            
            // sort date 
            data.sort(function(a, b) {
                return a.date.localeCompare(b.date);
            });
      
        }
        
        if (dateEnd - dateStart < 2 ){

            function aggregateWeatherData(inputData) {
                const result = {};

                
                inputData.forEach(item => {
                    const dateKey = item.Date_ID.substring(0, 8); 
                    const weather = item.天候名稱;

                    if (!result[dateKey]) {
                        result[dateKey] = { date: dateKey };
                        keys.forEach(w => {
                            result[dateKey][w] = 0;
                        });
                    }

                
                    result[dateKey][weather]++;
                });

                return Object.values(result);
            }

            data = aggregateWeatherData(raw_data);

             // parse the date
            var parseDate = d3.timeParse("%Y%m%d");
            data.forEach(function(d) {
                d.date_standard = parseDate(d.date);
            });

   
        }

        let year = "2022";
        let startDate = year + dateStart.toString().padStart(2, '0'); // "202201"
        let endDate = year + (+dateEnd+1).toString().padStart(2, '0');     // "202203"

        // filter date between startDate and endDate
        let filteredData = data.filter(record => {
            let dateId = record.date;
            return dateId >= startDate && dateId <= endDate;
        });

        // renew data 
        data = filteredData;
        console.log("stream",data);

        // Add X axis
        const x = d3.scaleTime()
        .domain(d3.extent(data, function(d) { return d.date_standard; })) // input = date.min ~ date.max
        .range([ 0, width ]);
        svg.append("g")
        .attr("transform", `translate(0, ${height+3})`)
        .call(d3.axisBottom(x));

        // Add Y axis
        const y = d3.scaleLinear()
            .domain([-d3.max(data, function(d) { return d['晴'] + d['陰'] + d['雨']; })/2, d3.max(data, function(d) { return d['晴'] + d['陰'] + d['雨']; })/2])
            .range([height, 0]);

        svg.append("g")
            .call(d3.axisLeft(y));

        svg
            .selectAll("path.domain")
            .style("opacity", 0)
            .transition()
            .duration(transition_time)
            .style("opacity", 0.8);

        svg
            .selectAll("line")
            .style("opacity", 0)
            .transition()
            .duration(transition_time)
            .style("opacity", 0.8);

        svg
            .selectAll("text")
            .style("opacity", 0)
            .transition()
            .duration(transition_time)
            .style("opacity", 0.8);


        // color palette
        const color = d3.scaleOrdinal()
        .domain(keys)
        .range(colors)

        // stack the data
        const stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys)
        (data)


        // Show the areas
        svg
            .selectAll("mylayers")
            .data(stackedData)
            .join("path")
            .style("fill", function(d) { return color(d.key); })
            .style("opacity", 0)
            .attr("d", d3.area()
                .x(function(d, i) { 
                    return x(d.data.date_standard); })
                .y0(function(d) {
                    return y(d[0]); })
                .y1(function(d) { return y(d[1]); })
            )

        svg
            .selectAll("path")
            .transition()
            .duration(transition_time)
            .style("opacity", 0.8);


        // add tooltip
        var tooltip = d3.select("#stream_chart")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "rgba(0, 0, 0, 0.7)");

        // when mouse stopped, show the black stroke of the path
        var mouseover = function(event, d) {
            d3.select(this) 
                .style("stroke", "black")
                .style("stroke-width", "2.5px")
                .style("opacity", 1);
        };

        var mousemove = function(event, d) {
            var category = d.key;
            // catch the position of mouse
            const [x, y] = d3.pointer(event);

            // create inverse scale to convert x value to date
            var xInverse = d3.scaleTime()
                .domain([0, width])
                .range(d3.extent(data, function(d) { return d.date_standard; }));

            var dataX = xInverse(x);
            var value, date_start, date_end;
            parseDate = d3.timeParse("%Y%m%d");

            for (let i = 0; i < data.length; i++){
                if (dateEnd - dateStart > 10 ){
                    if (dataX.getTime() <= parseDate(data[0].date + '15').getTime()){
                        date_start = data[0].date_standard;
                        date_end = data[0].endDate;
                        value = data[0][category];
                        break;
                    }
                    if (dataX.getTime() >= parseDate(data[i].date + '15').getTime() && dataX.getTime() < parseDate(data[i+1].date + '15').getTime()) {
                        date_start = data[i+1].date_standard;
                        date_end = data[i+1].endDate;
                        value = data[i+1][category];
                        break;
                    }
                }
                else{
                    if (dataX.getTime() >= data[i].date_standard.getTime() && dataX.getTime() < data[i+1].date_standard.getTime()) {
                        // dataX between data[i] and data[i+1]
                        date_start = data[i].date_standard;
                        date_end = data[i].endDate;
                        value = data[i][category];
                        break;
                    }
                }
            }

            tooltip
                    .style("opacity", 1)
                    .style("color", "white")
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px");

            if (dateEnd - dateStart <= 10 && dateEnd - dateStart >= 2 ){
                var dateParser = d3.timeFormat("%b %d");
                tooltip
                    .html(`天氣: ${category}<br>Date: ${dateParser(date_start)} ~ ${dateParser(date_end)}<br>案例數: ${value}`)

            }
            if (dateEnd - dateStart < 2 ){
                var dateParser = d3.timeFormat("%b %d");
                tooltip
                    .html(`天氣: ${category}<br>Date: ${dateParser(date_start)}<br>案例數: ${value}`)

            }
            if (dateEnd - dateStart > 10 ){
                var dateParser = d3.timeFormat("%b %Y");
                tooltip
                    .html(`天氣: ${category}<br>Date: ${dateParser(date_start)}<br>案例數: ${value}`)
            }

            
        }

        var mouseleave = function(d) {
            tooltip
                .style("opacity", 0);
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8);
        };

        // add mouseevent
        svg.selectAll("path")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave);


        d3.select("body")
            .append("div")
            .attr("id", "tooltip")
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "1px solid #d3d3d3")
            .style("border-radius", "5px")
            .style("padding", "5px")
            .style("opacity", 0);

        // create legend
        const legendContainer = d3.select("#stream_chart").append("div");

        // set color
        const legendData = [
            { className: "晴天", color: colors[0] },
            { className: "陰天", color: colors[1] },
            { className: "雨天", color: colors[2] },
        ];

        // create legend block
        const legendItems = legendContainer.selectAll("div")
            .data(legendData)
            .enter().append("div")
            .style("margin-right", "10px")
            .style("display", "inline-block") // 水平排列;

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

        legendItems.style("opacity", 0)
            .transition()
            .duration(transition_time)
            .style("opacity", 1);



    }).catch(function(error) {
    console.error('Error loading the CSV file:', error);
    });
}