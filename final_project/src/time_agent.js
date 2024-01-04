const transition_time = 800;
var csv_file_path = "../dataset/time_dependent_data_A1.csv"

drawAll(1, 12, 1);

function getSelectType(val){
    /* get time information from datepicker */
    let start_time = $("#datepicker").val();
    let end_time = $("#datepicker2").val();

    /* parse the month information */
    let start_month = start_time.split("-")[0];
    let end_month = end_time.split("-")[0];

    console.log("start_month: " + start_month);
    console.log("end_month: " + end_month);
    console.log("accident_type: " + val);

    if(val == "1"){
        csv_file_path = "../dataset/time_dependent_data_A1.csv";
    }
    else if(val == "2"){
        csv_file_path = "../dataset/time_dependent_data_A2.csv";
    }
    else{
        csv_file_path = "../dataset/time_dependent_data_A1.csv";
    }

    // loader = d3
    //     .select("div.test")
    //     .style("opacity", 1)
    //     .style("width", "100%")
    //     .style("height", "100%")
    //     .style("z-index", 100)
    //     .style("fill", "#ffffff");
    drawAll(start_month, end_month, val);

    // loader
    //     .transition()
    //     .duration(transition_time)
    //     .style("opacity", 0);
}

function getTime(){
    /* get time information from datepicker */
    let start_time = $("#datepicker").val();
    let end_time = $("#datepicker2").val();

    /* parse the month information */
    let start_month = start_time.split("-")[0];
    let end_month = end_time.split("-")[0];

    var accident_select = document.querySelector("#accident_type");
    var accident_type = accident_select.options[accident_select.selectedIndex].value;

    console.log("start_month: " + start_month);
    console.log("end_month: " + end_month);
    console.log("accident_type: " + accident_type);

    if(accident_type == "1"){
        csv_file_path = "../dataset/time_dependent_data_A1.csv";
    }
    else if(accident_type == "2"){
        csv_file_path = "../dataset/time_dependent_data_A2.csv";
    }
    else{
        csv_file_path = "../dataset/time_dependent_data_A1.csv";
    }

    drawAll(start_month, end_month, accident_type);
}

async function drawAll(start_month, end_month, type){

        /* read the csv file */
        d3.csv(csv_file_path).then(function(data) {
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
        /* call the drawMap function */
        drawMap(start_month, end_month, data);
    
        /* call the drawHeatmap function */
        drawHeatmap(start_month, end_month, data);

        /* call the death_chart function */
        death_line(start_month, end_month);

        /* call the weather_stream function */
        weather_stream(start_month, end_month);

        /* cause of accident */
        cause_bar(start_month, end_month);

        /* car top view */
        drawCarTopView(start_month, end_month);
    });

    // Promise.all([
    //     drawMap(start_month, end_month, type)
    //     // drawHeatmap(start_month, end_month, type),
    //     // death_line(start_month, end_month, type),
    //     // weather_stream(start_month, end_month, type),
    //     // cause_bar(start_month, end_month, type),
    //     // drawCarTopView(start_month, end_month, type)
    // ]
    //     ).then(function(){
    //         console.log("done");
    //     }
    // );

}