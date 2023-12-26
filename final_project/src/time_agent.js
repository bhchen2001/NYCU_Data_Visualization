const transition_time = 800;
const csv_file_path = "../dataset/time_dependent_data_A1.csv"

function getTime(){
    /* get time information from datepicker */
    let start_time = $("#datepicker").val();
    let end_time = $("#datepicker2").val();

    /* parse the month information */
    let start_month = start_time.split("-")[0];
    let end_month = end_time.split("-")[0];

    console.log("start_time: " + start_time);
    console.log("end_time: " + end_time);

    /* call the drawMap function */
    drawMap(start_month, end_month);

    /* call the drawHeatmap function */
    drawHeatmap(start_month, end_month);
}