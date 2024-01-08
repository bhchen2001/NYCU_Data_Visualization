
function death_line(datestart, dateend){
    d3.csv(csv_file_path).then(function(raw_data) {
        /* filter the data with current_county */
        if(current_county != "全台灣"){
            raw_data = raw_data.filter(function(d) {
                return d.發生地點 == current_county;
            });
        }
        // create container
        var newDiv = document.createElement("div");
        newDiv.id = "line_legend";
        document.body.appendChild(newDiv);

        newDiv = document.createElement("div");
        newDiv.id = "linechart";
        document.body.appendChild(newDiv);
        let data;

        if (dateend - datestart > 10){

            // parse the date
            var parseDate = d3.timeParse("%Y%m");
            var dateParser = d3.timeFormat("%Y%m");

            function aggregateData(inputData) {
                const result = {};
                
                inputData.forEach(item => {
                    const dateKey = item.Date_ID.substring(0, 6); 
                    const death_num = parseInt(item.死亡人數, 10);
                    const injury_num = parseInt(item.受傷人數, 10);

                    if (!result[dateKey]) {
                        result[dateKey] = {
                            death_num: 0,
                            injury_num: 0,
                            date_id: dateParser(parseDate(dateKey)),
                            date: parseDate(dateKey), 
                        };
                    }

                    result[dateKey].death_num += death_num;
                    result[dateKey].injury_num += injury_num;
                });

                return Object.values(result);
            }

            data = aggregateData(raw_data);    
            
        }

        if (dateend - datestart >= 2 && dateend - datestart <= 10){

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
                    const death_num = parseInt(item.死亡人數, 10);
                    const injury_num = parseInt(item.受傷人數, 10);
                    const weekNum = getWeekNumber(dateKey);
                    const weekKey = `${dateKey.substring(0, 4)}W${weekNum.toString().padStart(2, '0')}`;
                    // parse the date
                    var parseDate = d3.timeParse("%YW%W");
                    var dateParser = d3.timeFormat("%Y%m%d");
        
                    if (!result[weekKey]) {
                        result[weekKey] = { 
                            death_num: 0,
                            injury_num: 0,
                            date_id: dateParser(parseDate(weekKey)),
                            date: parseDate(weekKey), 
                            endDate: new Date(parseDate(weekKey).getTime() + 6 * 24 * 60 * 60 * 1000)
                        };
                    }
                           
                    result[weekKey].death_num += death_num;
                    result[weekKey].injury_num += injury_num;
                });

                return Object.values(result);
            }
        
            data = aggregateWeatherData(raw_data);
            
            // sort date 
            data.sort(function(a, b) {
                return a.date_id.localeCompare(b.date_id);
            });
        
   
        
        }

        if (dateend - datestart < 2){
            // parse the date
            var parseDate = d3.timeParse("%Y%m%d");
            var dateParser = d3.timeFormat("%Y%m%d");
            
            function aggregateData(inputData) {
                const result = {};

                inputData.forEach(item => {
                    const dateKey = item.Date_ID.substring(0, 8);
                    const death_num = parseInt(item.死亡人數, 10);
                    const injury_num = parseInt(item.受傷人數, 10); 

                    if (!result[dateKey]) {
                        result[dateKey] = { 
                            death_num: 0,
                            injury_num: 0,
                            date_id: dateParser(parseDate(dateKey)),
                            date: parseDate(dateKey),

                        };
 
                    }
                    result[dateKey].death_num += death_num;
                    result[dateKey].injury_num += injury_num;
                });

                return Object.values(result);
            }

            data = aggregateData(raw_data);

        }

        let year = "2022";
        let startDate = year + datestart.toString().padStart(2, '0'); // "202201"
        let endDate = year + (+dateend+1).toString().padStart(2, '0');     // "202203"

        // filter date between startDate and endDate
        let filteredData = data.filter(record => {
            let dateId = record.date_id;
            return dateId >= startDate && dateId <= endDate;
        });

        // renew data 
        data = filteredData;
        console.log("line",data);

         // set size of range
        const margin = {top: 20, right: 30, bottom: 30, left: 60},
            width = 1000 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;
        
        // set scaler of x,y
        const x = d3.scaleTime().range([0, width]),
            y = d3.scaleLinear().range([height, 0]);
        
        // define line
        const line = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.death_num); });

        /* remove the previous svg and tooltip */
        d3.select("#line_chart").select("svg").remove();
        d3.select("#line_chart").select(".tooltip").remove();
        d3.select("#line_chart").select("div").remove();
        
        // create svg container
        const svg = d3.select("#line_chart").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        

        // sort date
        data.sort((a, b) => a.date - b.date);
        
        // set range of x,y
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([d3.min(data, function(d) { return Math.min(d.death_num,d.injury_num); }), d3.max(data, function(d) { return Math.max(d.death_num,d.injury_num); })]);
        
         // define line chart of deaths
        const deathLine = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.death_num); });

        // define line chart of injuries
        const injuryLine = d3.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.injury_num); });

        
        // draw x-axis
        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));
        
        // draw y-axis
        svg.append("g")
            .call(d3.axisLeft(y));

        svg
            .selectAll("path.domain")
            .style("opacity", 0)
            .transition()
            .duration(transition_time)
            .style("opacity", 1);

        svg
            .selectAll("line")
            .style("opacity", 0)
            .transition()
            .duration(transition_time)
            .style("opacity", 1);

        svg
            .selectAll("text")
            .style("opacity", 0)
            .transition()
            .duration(transition_time)
            .style("opacity", 1);
        
        // draw line chart of deaths
        svg.append("path")
            .datum(data)
            .transition()
            .duration(transition_time)
            .attr("fill", "none")
            .attr("stroke", "#C70039")
            .attr("stroke-width", 3)
            .attr("d", deathLine);

        // draw points of deaths
        svg.selectAll(".death-dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "death-dot")
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.death_num); })
            .transition()
            .duration(transition_time)
            .attr("r", 5) 
            .attr("fill", "#C70039");
        
        // draw line chart of injuries
        svg.append("path")
            .datum(data)
            .transition()
            .duration(transition_time)
            .attr("fill", "none")
            .attr("stroke", "#FFC300")
            .attr("stroke-width", 3)
            .attr("d", injuryLine);

        // draw points of injuries
        svg.selectAll(".injury-dot")
            .data(data)
            .enter().append("circle") 
            .attr("class", "injury-dot")
            .attr("cx", function(d) { return x(d.date); })
            .attr("cy", function(d) { return y(d.injury_num); })
            .transition()
            .duration(transition_time)
            .attr("r", 5) 
            .attr("fill", "#FFC300");


         // add tooltip
         var tooltip = d3.select("#line_chart")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "rgba(0, 0, 0, 0.7)");

        // when mouse stopped, show the black stroke of the path
        var mouseover = function(event, d) {
            d3.select(this) 
                .style("stroke", "black")
                .style("stroke-width", "2.5px");
        };

        if (dateend - datestart > 10){
            var dateParser = d3.timeFormat("%b %Y");
        }
        else{
            var dateParser = d3.timeFormat("%b %d");
        }

        var mousemove_death = function(event, d) {
            // catch the position of mouse
            const [x, y] = d3.pointer(event);
            // const tooltip = d3.select("#tooltip");
            tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY + 10 + "px");
            if (dateend - datestart >= 2 && dateend - datestart <= 10){
                tooltip
                .style("color", "white")
                .html(`Date: ${dateParser(d.date.getTime())} ~ ${dateParser(d.endDate.getTime())}<br>死亡人數: ${d.death_num}`);

            }
            else{
                tooltip
                .style("color", "white")
                .html(`Date: ${dateParser(d.date.getTime())}<br>死亡人數: ${d.death_num}`);
            }
        }

        var mousemove_injuries = function(event, d) {
            const [x, y] = d3.pointer(event);
            // const tooltip = d3.select("#tooltip");
            tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 10 + "px")
                .style("top", event.pageY + 10 + "px");
            if (dateend - datestart >= 2 && dateend - datestart <= 10){
                tooltip
                .style("color", "white")
                .html(`Date: ${dateParser(d.date.getTime())} ~ ${dateParser(d.endDate.getTime())}<br>受傷人數: ${d.injury_num}`);
            }
            else{
                tooltip
                .style("color", "white")
                .html(`Date: ${dateParser(d.date.getTime())}<br>受傷人數: ${d.injury_num}`);
            }
        }

        var mouseleave = function(d) {
            tooltip
                .style("opacity", 0);
            d3.select(this)
                .style("stroke", "none"); 
        };

        // add mouseevent
        svg.selectAll(".death-dot")
            .on("mouseover", mouseover) 
            .on("mousemove", mousemove_death)
            .on("mouseleave", mouseleave); 

        svg.selectAll(".injury-dot")
            .on("mouseover", mouseover) 
            .on("mousemove", mousemove_injuries)
            .on("mouseleave", mouseleave);   

        // create legend
        const legendContainer = d3.select("#line_chart").append("div");

        // set color
        const legendData = [
            { className: "死亡人數", color: "#C70039" },
            { className: "受傷人數", color: "#FFC300" },
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