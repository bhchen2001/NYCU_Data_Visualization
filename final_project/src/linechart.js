
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

        if (dateend - datestart < 2){
            // convert Date_ID to %Y%m%d
            function getFormattedDate(dateId) {
                return dateId.substring(0, 8);
            }

            // using reduce funciton to calculate deaths & Injuries
            let summary = raw_data.reduce((accumulator, current) => {
                let date = getFormattedDate(current.Date_ID);
                let month = parseInt(date.substring(4, 6), 10);
                let deaths = parseInt(current.死亡人數, 10);
                let injuries = parseInt(current.受傷人數, 10);

                // filter month
                if (month >= datestart && month <= dateend) {
                    if (!accumulator[date]) {
                        accumulator[date] = { deaths: 0, injuries: 0 };
                    }
                    accumulator[date].deaths += deaths;
                    accumulator[date].injuries += injuries;
                }

                return accumulator;
            }, {});

            // convert format
            data = Object.keys(summary).map(date => {
                return { date: date, death_num: summary[date].deaths, injury_num: summary[date].injuries };
            });

            // parse the date
            var parseDate = d3.timeParse("%Y%m%d");
            data.forEach(function(d) {
                d.date = parseDate(d.date);
            });
        }

        if (dateend - datestart >= 2 && dateend - datestart <= 10){

            // Function to convert Date_ID to %Y%m%d
            function getFormattedDate(dateId) {
                return dateId.substring(0, 8);
            }

            // Function to get the week number belonging to the date
            function getWeekNumber(dateString) {
                let date = new Date(dateString.substring(0, 4), dateString.substring(4, 6) - 1, dateString.substring(6, 8));
                let firstDayOfYear = new Date(date.getFullYear(), 0, 1);
                let pastDaysOfYear = (date - firstDayOfYear) / 86400000;
                return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
            }

            // Function to get the start of the week belonging to this date
            function getWeekStartDate(dateString) {
                let date = new Date(dateString.substring(0, 4), dateString.substring(4, 6) - 1, dateString.substring(6, 8));
                // Calculate the difference in days to Monday
                let dayDiff = date.getDay() === 0 ? 6 : date.getDay() - 1; // Note: getDay() is 0 (Sunday) to 6 (Saturday)
                let weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - dayDiff);
                return weekStart.toISOString().split('T')[0]; // Format to YYYY-MM-DD
            }

            // Function to get the end of the week belonging to this date
            function getWeekEndDate(dateString) {
                let date = new Date(dateString.substring(0, 4), dateString.substring(4, 6) - 1, dateString.substring(6, 8));
                // Calculate the difference in days to Sunday
                let dayDiff = date.getDay() === 0 ? 0 : 7 - date.getDay(); // Note: getDay() is 0 (Sunday) to 6 (Saturday)
                let weekEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayDiff);
                return weekEnd.toISOString().split('T')[0]; // Format to YYYY-MM-DD
            }

            // Use the reduce function to count deaths and injuries and filter and organize data by week
            let summary = raw_data.reduce((accumulator, current) => {
                let date = getFormattedDate(current.Date_ID);
                let month = parseInt(date.substring(4, 6), 10);
                let year = date.substring(0, 4);
                let deaths = parseInt(current.死亡人數, 10);
                let injuries = parseInt(current.受傷人數, 10);

                /// Filter months and count weeks
                if (month >= datestart && month <= dateend) {
                    let weekNum = getWeekNumber(date);
                    let weekKey = `${year}W${weekNum.toString().padStart(2, '0')}`;

                    // If data for this week has not been created yet, initialize
                    if (!accumulator[weekKey]) {
                        let weekStartDate = getWeekStartDate(date); 
                        let weekEndDate = getWeekEndDate(date); 
                        accumulator[weekKey] = {
                            deaths: 0,
                            injuries: 0,
                            startDate: weekStartDate, 
                            endDate: weekEndDate 
                        };
                    }
                    accumulator[weekKey].deaths += deaths;
                    accumulator[weekKey].injuries += injuries;
                }


                return accumulator;
            }, {});


            data = Object.keys(summary).map(weekKey => {
                return {
                    week: weekKey,
                    death_num: summary[weekKey].deaths,
                    injury_num: summary[weekKey].injuries,
                    date: summary[weekKey].startDate, 
                    endDate: summary[weekKey].endDate 
                };
            });
            data.shift(); 
        
            // parse the date
            var parseDate = d3.timeParse("%Y-%m-%d");
            data.forEach(function(d) {
                d.date = parseDate(d.date);
                d.endDate = parseDate(d.endDate);
            });
   
        
        }

        if (dateend - datestart > 10){
            // convert Date_ID to %Y%m%d
            function getFormattedDate(dateId) {
                return dateId.substring(0, 6);
            }

            // using reduce funciton to calculate deaths & Injuries
            let summary = raw_data.reduce((accumulator, current) => {
                let date = getFormattedDate(current.Date_ID);
                let month = parseInt(date.substring(4, 6), 10);
                let deaths = parseInt(current.死亡人數, 10);
                let injuries = parseInt(current.受傷人數, 10);

                // filter month
                if (month >= datestart && month <= dateend) {
                    if (!accumulator[date]) {
                        accumulator[date] = { deaths: 0, injuries: 0 };
                    }
                    accumulator[date].deaths += deaths;
                    accumulator[date].injuries += injuries;
                }

                return accumulator;
            }, {});

            // convert format
            data = Object.keys(summary).map(date => {
                return { date: date, death_num: summary[date].deaths, injury_num: summary[date].injuries };
            });

            // parse the date
            var parseDate = d3.timeParse("%Y%m");
            data.forEach(function(d) {
                d.date = parseDate(d.date);
            });
        }

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

        if (dateend - datestart > 8){
            var dateParser = d3.timeFormat("%b %Y");
        }
        else{
            var dateParser = d3.timeFormat("%b %d %Y");
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