drawMap(1, 12);

const county_geomap_api = "../dataset/taiwan-geomap.json";


let countiesData = [];

function drawMap(start_month, end_month) {

  /* read the data from the csv file */
  d3.csv(csv_file_path).then(function(data){
    /* format the Date_ID */
    var parseDate = d3.timeParse("%Y%m%d%H%M%S");
    data.forEach(function(d) {
      d.Date_ID = parseDate(d.Date_ID);
    });
    /* keep valid rows */
    data = data.filter(function(d) {
      return d.Date_ID.getMonth() + 1 >= start_month && d.Date_ID.getMonth() + 1 <= end_month;
    });
    /* keep valid rows */
    data = data.filter(function(d) {
      return d.Date_ID.getMonth() + 1 >= start_month && d.Date_ID.getMonth() + 1 <= end_month;
    });
    /* drop other columns */
    data = data.map(function(d) {
      return {
        city: d.發生地點,
        mobile: d.行動電話或電腦或其他相類功能裝置名稱,
        drunk: d.是否酒駕,
        death: d.死亡人數,
        injury: d.受傷人數
      };
    });

    /* count the number of each attribute for each city by using rollup */
    var count = d3.rollup(data, function(v){
      return{
        mobile: d3.sum(v, function(d){ return d.mobile; }),
        drunk: d3.sum(v, function(d){ return d.drunk; }),
        death: d3.sum(v, function(d){ return d.death; }),
        injury: d3.sum(v, function(d){ return d.injury; })
      }
    }
    , d => d.city);

    /* sort the cities by the number of death */
    count = Array.from(count).sort(function(a, b){
      return b[1].death - a[1].death;
    }
    );

    /* add rank to each city */
    count.forEach(function(d, i){
      d[1].rank = i + 1;
    });

    /* create a new array to store the data */
    count.forEach(function(d){
      countiesData.push({
        city: d[0],
        death: d[1].death,
        mobile: d[1].mobile,
        drunk: d[1].drunk,
        injury: d[1].injury,
        rank: d[1].rank
      });
    });

    renderMap();  
  })
}

function renderMap() {
  /* remove te previous svg and tooltip */
  d3.select("#taiwan").select("svg").remove();
  d3.select("#taiwan").select(".tooltip").remove();

  let svg = d3
    .select("#taiwan")
    .append("svg")
    .style("height", "80vh")
    .style("width", "70vh");

  let defs = svg.append("defs");

  let gradient = defs.append("linearGradient")
    .attr("id", "oceanGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  // Define the gradient stops
  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "#18a8f5"); // Light color
  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#181cf5"); // Dark color

  rect = svg
    .append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("fill", "url(#oceanGradient)")
    .attr("opacity", 0);

  rect
    .transition()
    .duration(600)
    .attr("opacity", 0.7);

  const tooltip = d3
    .select("#taiwan")
    .append("div")
    .attr("id", "chart")
    .attr("class", "tooltip");

  function mouseover(event, d) {
    d3
      .select(this)
      .transition()
      .duration(50)
      .style("opacity", 1)
    d3
      .select(this)
      .style("stroke-width", 4);
    tooltip
      .style("background", "rgba(0, 0, 0, 0.7)")
      .attr("opacity", 0.7);
  }

  function mousemove(event, d) {
    tooltip
      .html(d.properties.COUNTYNAME + "死亡人數 : " + d.death)
      .style("top", event.pageY - 10 + "px")
      .style("left", event.pageX + 30 + "px");
  }

  function mouseleave(event, d) {
    d3
      .select(this)
      .transition()
      .duration(100)
      .style("opacity", 0.8)
    d3
      .select(this)
      .style("stroke-width", 2);
    tooltip
      .style("background", "rgba(0, 0, 0, 0)").html("")
      .attr("opacity", 0);
  }

  d3.json(county_geomap_api).then((data) => {
    /* turn into topo data */
    const counties = topojson.feature(data, data.objects.COUNTY_MOI_1090820);
    counties.features.forEach(({ properties }, index) => {
      countiesData.find(({ rank, death, city }) => {
        if (properties.COUNTYNAME === city) {
          counties.features[index].rank = rank;
          counties.features[index].death = death;
        }
      });
    });

    /* set center and scale */
    const projection = d3.geoMercator().center([122, 24.3]).scale(9000);
    /* turn the projection into path data */
    const path = d3.geoPath().projection;

    /* Build color scale */
    const colorScale = d3
      .scaleLinear()
      .domain([1, 22])
      .range([
        "#e31a1c", // <= the darkest shade we want
        "#ffeda0" // <= the lightest shade we want
      ]);

    const geoPath = svg
      .selectAll(".geo-path")
      .data(counties.features)
      .join("path")
      .attr("class", "geo-path")
      .attr("d", path(projection))
      /* slow down the efficiency */
      // .style("stroke", "#ffffff")
      .style("stroke-width", 2)
      .style("fill", "none")
      .style("opacity", 0);

    geoPath
      .transition()
      .duration(transition_time)
      .style("fill", (d) => {
          return colorScale(d?.rank) || "#d6d6d6";
      })
      .style("opacity", 0.8);

    geoPath
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave);
      
  });
}