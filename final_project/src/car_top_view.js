getCarData();

function getCarData(){
    /* read the svg file and plot the car */
    d3.xml("../dataset/car_topview.svg").then(function(data){
        d3.select("#car").node().append(data.documentElement);
        
        /* modified the color of the car */
    });
}