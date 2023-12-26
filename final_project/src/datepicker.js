$(function(){
    $("#datepicker").datepicker( {
        format: "mm-yyyy",
        startView: "months",
        minViewMode: "months",
        updateViewDate: true,
        changeYear: true,
        autoclose: true,
        useCurrent: false,
        defaultViewDate: new Date(2022, 1)
    })
    .val("01-2022")
    .on("changeDate", function(e) {
        /* disable the previous dates of datepicker2 */
        var date = $("#datepicker").datepicker("getDate");
        date.setMonth(date.getMonth());
        $("#datepicker2").datepicker("setStartDate", date);
        /* show the datepicker2 */
        $("#datepicker2").datepicker("show");
    });

    $('#datepicker')
        .datepicker('setStartDate', new Date(2022, 0))
        .datepicker('setEndDate', new Date(2022, 11));
});

$(function(){
    $("#datepicker2").datepicker( {
        format: "mm-yyyy",
        startView: "months", 
        minViewMode: "months",
        updateViewDate: true,
        changeYear: true,
        autoclose: true,
        useCurrent: false,
        setStartDate: new Date(2022, 1),
        setEndDate: new Date(2022, 12),
        defaultViewDate: new Date(2022, 12)
    })
    .val("12-2022")
    .on("changeDate", function(e){
        /* call the getTime function */
        getTime();
    });

    $('#datepicker2')
        .datepicker('setStartDate', new Date(2022, 0))
        .datepicker('setEndDate', new Date(2022, 11));
});