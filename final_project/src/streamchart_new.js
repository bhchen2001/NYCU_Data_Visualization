function weather_stream(dateStart, dateEnd){
                d3.csv("time_dependent_data_A2.csv").then(function(raw_data) {
                    
                    // create container
                    var newDiv = document.createElement("div");
                    newDiv.id = "legend";
                    document.body.appendChild(newDiv);

                    newDiv = document.createElement("div");
                    newDiv.id = "streamchart";
                    document.body.appendChild(newDiv);

                    // set the dimensions and margins of the graph
                    const margin = {top: 20, right: 30, bottom: 30, left: 60},
                    width = 800 - margin.left - margin.right,
                    height = 300 - margin.top - margin.bottom;

                    // append the svg object to the body of the page
                    const svg = d3.select("#streamchart")
                    .append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    // .attr("style", "border: 1px solid #000000;" )
                    .append("g")
                    .attr("transform",
                            `translate(${margin.left}, ${margin.top})`);
             

                    var keys = ['晴', '陰', '雨'];
                    var colors = ['#ffc300','#87bfd5','#0b9bf1'];
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

                    let year = "2022";
                    let startDate = year + dateStart.toString().padStart(2, '0'); // "202201"
                    let endDate = year + dateEnd.toString().padStart(2, '0');     // "202203"

                    // filter date between startDate and endDate
                    let filteredData = data.filter(record => {
                        let dateId = record.date;
                        return dateId >= startDate && dateId <= endDate;
                    });

                    // renew data 
                    data = filteredData;


                    
                    // parse the date
                    var parseDate = d3.timeParse("%Y%m");
                    data.forEach(function(d) {
                        d.date_standard = parseDate(d.date);
                    });

                    // Add X axis
                    const x = d3.scaleTime()
                    .domain(d3.extent(data, function(d) { return d.date_standard; })) // input = date.min ~ date.max
                    .range([ 0, width ]);
                    svg.append("g")
                    .attr("transform", `translate(0, ${height})`)
                    .call(d3.axisBottom(x).ticks(12));

                    // Add Y axis
                    const y = d3.scaleLinear()
                        .domain([-d3.max(data, function(d) { return d['晴'] + d['陰'] + d['雨']; })/2, d3.max(data, function(d) { return d['晴'] + d['陰'] + d['雨']; })/2])
                        .range([height, 0]);

                    svg.append("g")
                        .call(d3.axisLeft(y));


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
                        .attr("d", d3.area()
                            .x(function(d, i) { return x(d.data.date_standard); })
                            .y0(function(d) { return y(d[0]); })
                            .y1(function(d) { return y(d[1]); })
                        )


                    // add tooltip
                    var tooltip = d3.select("#streamchart")
                        .append("div")
                        .style("opacity", 0)
                        .attr("class", "tooltip");

                    // when mouse stopped, show the black stroke of the path
                    var mouseover = function(event, d) {
                        d3.select(this) 
                            .style("stroke", "black")
                            .style("stroke-width", "2.5px");
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
                        var value, date_point;

                        for (let i = 0; i < data.length; i++){
                            if (dataX.getTime() >= data[i].date_standard.getTime() && dataX.getTime() < data[i+1].date_standard.getTime()) {
                                // dataX between data[i] and data[i+1]
                                date_point = data[i].date_standard;
                                value = data[i][category];
                                break;
                            }

                        }

                        var dateParser = d3.timeFormat("%b %Y");

                        const tooltip = d3.select("#tooltip");
                            tooltip
                                .style("opacity", 1)
                                .html(`Weather: ${category}<br>Date: ${dateParser(date_point)}<br>Count: ${value}`)
                                .style("left", x+100+ "px")
                                .style("top", y+100+ "px");
                    }

                    var mouseleave = function(d) {
                        d3.select("#tooltip").style("opacity", 0);
                        d3.select(this)
                            .style("stroke", "none"); 
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
                    const legendContainer = d3.select("#legend");

                    // set color
                    const legendData = [
                        { className: "Sunny", color: colors[0] },
                        { className: "Cloudy", color: colors[1] },
                        { className: "Rainy", color: colors[2] },
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



                }).catch(function(error) {
                console.error('Error loading the CSV file:', error);
                });
       

                
            }