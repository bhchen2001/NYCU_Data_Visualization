console.clear();

const county_geomap_api =
  "../dataset/taiwan-geomap.json";
const county_revenue_api =
  "../dataset/accident_count.json";

let countiesData = [];

(function getData() {
  axios.get(county_revenue_api).then((res) => {
    countiesData = res.data[0].data;
    render();
  });
})();

function render() {
  // 設置畫布
  let svg = d3
    .select("#canvas")
    .append("svg")
    .style("background", "rgba(60, 150, 224, 0.877)")
    .style("height", "80vh")
    .style("width", "70vh");

  //   設置提示字
  let tooltip = d3
    .select("#canvas")
    .append("div")
    .attr("id", "chart")
    .attr("class", "tooltip")
    .style("opacity", 0);

  function mouseOver(){
    // hightlight the county opacity and show tooltip
    d3
      .select(this)
      .attr("opacity", "1")
      .attr("stroke-width", "3")
    tooltip
      .style("opacity", 1)
  }

  function mouseMove(event, d){
    console.log(d)
    tooltip
      .html(d.properties.COUNTYNAME + "死亡人數 : " + d.death)
      .style("top", event.pageY - 10 + "px")
      .style("left", event.pageX + 30 + "px");
  }

  function mouseOut(){
    // remove the hightlight and hide tooltip
    d3
      .select(this)
      .attr("opacity", "0.8")
      .attr("stroke-width", "1")
    tooltip
      .style("opacity", 0)
  }

  //   設置提示字顯示位置
  // d3.select("#canvas").on("mousemove", function (e) {
  //   tooltip.style("right", 0).style("top", "50vh");
  // });

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

    //     設置中心位置與縮放大小
    const projection = d3.geoMercator().center([122, 24.3]).scale(9000);
    //     將投影後的資料轉為路徑資料
    const path = d3.geoPath().projection;

    // 設置顏色漸層
    const colorScale = d3
      .scaleLinear()
      // 數字範圍
      .domain([1, 22])
      // 顏色範圍
      .range([
        "#ec595c", // <= the darkest shade we want
        "#bcafb0" // <= the lightest shade we want
      ]);

    const geoPath = svg
      .selectAll(".geo-path")
      .data(counties.features)
      .join("path")
      .attr("class", "geo-path")
      .attr("d", path(projection))
      //     縣市邊界線
      .attr("stroke", "#ffffff")
      .attr("stroke-width", "1")
      // 縣市底色
      .attr("fill", (d) => {
        return colorScale(d?.rank) || "#d6d6d6";
      })
      .attr("opacity", 0.8)
      // 滑鼠碰到觸發提示字
      .on("mouseover", mouseOver)
      .on("mousemove", mouseMove)
      .on("mouseout", mouseOut);
  });
}
