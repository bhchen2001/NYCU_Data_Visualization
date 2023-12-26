const county_geomap_api =
  "../dataset/taiwan-geomap.json";
const county_revenue_api =
  "../dataset/accident_count.json";

let countiesData = [];

getMapData();

function getMapData() {
  axios.get(county_revenue_api).then((res) => {
    countiesData = res.data[0].data;
    render();
  });
}

function render() {

  // 設置畫布
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
    .attr("stop-color", "#18a8f5"); // Light blue
  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "#181cf5"); // Dark blue

  rect = svg
    .append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .style("fill", "url(#oceanGradient)")
    .attr("opacity", 0);

  rect
    .transition()
    .duration(500)
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
      .style("stroke-width", 2.5);
    // show tooltip
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
      .style("stroke-width", 1);
    // kill tooltip
    tooltip
      .style("background", "rgba(0, 0, 0, 0)").html("")
      .attr("opacity", 0);
  }

  d3.json(county_geomap_api).then((data) => {
    //     轉成 topojson
    const counties = topojson.feature(data, data.objects.COUNTY_MOI_1090820);

    //     將 rank 和 revenue 加入 counties.features 內
    counties.features.forEach(({ properties }, index) => {
      countiesData.find(({ rank, death, city }) => {
        if (properties.COUNTYNAME === city) {
          counties.features[index].rank = rank;
          counties.features[index].death = death;
        }
      });
    });

    // 設置中心位置與縮放大小
    const projection = d3.geoMercator().center([122, 24.3]).scale(9000);
    // 將投影後的資料轉為路徑資料
    const path = d3.geoPath().projection;

    // 設置顏色漸層
    const colorScale = d3
      .scaleLinear()
      // 數字範圍
      .domain([1, 22])
      // 顏色範圍
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
      .style("stroke", "#ffffff")
      .style("stroke-width", "0")
      .style("fill", "none")
      .style("opacity", 0);

    geoPath
      .transition()
      .duration(600)
      .style("stroke-width", "2")
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
