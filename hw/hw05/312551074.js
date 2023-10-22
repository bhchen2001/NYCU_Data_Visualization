// set the size of svg
const width = 1800; const height = 30000;
const margin = {top: 10, right: 60, bottom: 50, left: 60};
// set the inner size of chart
const innerWidth = width - margin.right - margin.left;
const innerHeight = height - margin.top - margin.bottom;

var durationTime = 500;

let svg = d3.select('#my_stacked_bar_chart')
    .append('svg')
        .attr('width', width)
        .attr('height', height)
let plotG = svg
    .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

let csv_data = d3.csv("http://vis.lab.djosix.com:2023/data/TIMES_WorldUniversityRankings_2024.csv");
const bar_feature = ["scores_teaching", "scores_research", "scores_citations", "scores_industry_income", "scores_international_outlook"];
const bar_color = d3.scaleOrdinal()
        .domain(bar_feature)
        .range(['#40a832', '#21908dff', '#a83242', '#ed9542', '#4d09b3'])
let weighted_data = [];
let original_data = [];

function sort_data(weighted_data, sort_choice, sort_order){
    let sorted_data = [];
    if(sort_order == "ascending"){
        sorted_data = weighted_data.sort(function(a, b){
            return a[sort_choice] - b[sort_choice];
        })
    }
    else if(sort_order == "descending"){
        sorted_data = weighted_data.sort(function(a, b){
            return b[sort_choice] - a[sort_choice];
        })
    }
    return sorted_data;
}

// button click event
const confirm_button = document.querySelector("#confirm-button");
confirm_button.addEventListener("click", onclick_button);

function onclick_button() {
    // console.log("onclick_button()!")
    const sort_choice = document.querySelector("#sortChoice").value;
    const sort_order = d3.select('input[name="sortOrder"]:checked').node().value

    console.log(sort_choice);
    console.log(sort_order);

    // sort data
    let sorted_data = sort_data(weighted_data, sort_choice, sort_order);
    // console.log("new_data:", new_data)
    // console.log("sorted_data:", sorted_data)
    drawPlot(sorted_data);
}

csv_data.then((dataset) =>{
    // remove invalid data
    valid_dataset = dataset.filter(function(row){
        return row["rank"] != "Reporter";
    })
    // console.log(valid_dataset)
    // filter the columns
    valid_dataset.map(function(d){
        // save the score after weighting
        let tmp_entry = {};
        tmp_entry["scores_teaching"] = +d["scores_teaching"] * 0.295;
        tmp_entry["scores_research"] = +d["scores_research"] * 0.29;
        tmp_entry["scores_citations"] = +d["scores_citations"] * 0.3;
        tmp_entry["scores_industry_income"] = +d["scores_industry_income"] * 0.04;
        tmp_entry["scores_international_outlook"] = +d["scores_international_outlook"] * 0.075;
        tmp_entry["scores_overall"] = tmp_entry["scores_teaching"] + tmp_entry["scores_research"] + tmp_entry["scores_citations"] + 
                                      tmp_entry["scores_industry_income"] + tmp_entry["scores_international_outlook"]
        tmp_entry["name"] = d["name"];
        weighted_data.push(tmp_entry);
        // save the original data
        let ori_entry = {};
        ori_entry["scores_teaching"] = +d["scores_teaching"];
        ori_entry["scores_research"] = +d["scores_research"];
        ori_entry["scores_citations"] = +d["scores_citations"];
        ori_entry["scores_industry_income"] = +d["scores_industry_income"];
        ori_entry["scores_international_outlook"] = +d["scores_international_outlook"];
        ori_entry["name"] = d["name"];
        original_data.push(ori_entry);
    })
    console.log(original_data);
    drawPlot(sort_data(weighted_data, "scores_overall", "descending"));
})


function drawPlot(sorted_dataset){
    // remove previous plot
    plotG.selectAll('*').remove();

    // console.log(sorted_dataset);
    
    // create stacked data
    const stack_generator = d3.stack()
        .keys(bar_feature)
        .order(d3.stackOrderNone) 
        .offset(d3.stackOffsetNone);
    const stack_data = stack_generator(sorted_dataset);
    // console.log(stack_data)

    // check the max value for range of x axis
    // max_value = d3.max(stack_data[bar_feature.length - 1].map(function(d){
    //     return d[1];
    // }))
    // console.log(max_value)

    const y_text_space = 500;
    // x axis
    const x_scale = d3.scaleLinear()
        .domain([0, 100])
        .range([y_text_space, innerWidth]);
    const x_axis_bot = d3.axisBottom(x_scale)
        .tickSize(innerHeight)
        .tickPadding(5);
    const x_axis_top = d3.axisTop(x_scale)
        .tickSize(0)
        .tickPadding(2);
    plotG
        .append('g')
        .call(x_axis_top)
    plotG
        .append('g')
        .call(x_axis_bot)

    // y axis
    const y_scale = d3.scaleBand()
        .domain(sorted_dataset.map(function(row){
            return row["name"];
        }))
        .range([0, innerHeight])
        .padding(2);
    const y_axis = d3.axisLeft(y_scale)
        .tickSize(5)
        .tickPadding(10);
    plotG
        .append('g')
        .attr("transform", `translate(${y_text_space}, 0)`)
        .call(y_axis);

    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "chart")
        .attr("class", "tooltip");

    // tooltip events
    const mouseover = function (d) {
        tooltip
            .style("opacity", 1)
        d3.select(this)
            .style("opacity", .4)
    }
    const mousemove = function (event, d) {
        // get the original data of same school
        obj = original_data.filter(function(row){
            return row.name === d.data.name;
        })
        // get the selected attribute
        attr = Object.keys(d.data).find(key => d.data[key].toFixed(2) === (d[1] - d[0]).toFixed(2));
        tooltip
            .html((obj[0][attr]).toFixed(1))
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");
    }
    const mouseleave = function (d) {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("opacity", 1)
    }

    // plot the bar
    plotG
        .append('g')
            .selectAll('g')
            .data(stack_data)
            .join('g')
                .attr('fill', function(d){
                    return bar_color(d.key);
                })
                .selectAll('rect')
                .data(function(d){
                    return d;
                })
                .join('rect')
                    .attr('x', function(d){
                        return x_scale(d[0]);
                    })
                    .attr('y', function(d){
                        return y_scale(d.data.name) - 3;
                    })
                    .attr('width', function(d){
                        return (x_scale(d[1]) - x_scale(d[0]));
                    })
                    .attr('height', 10)
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave);
}