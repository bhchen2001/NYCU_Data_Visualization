// set the size of svg
const width = 700; const height = 650;
const margin = {top: 10, right: 10, bottom: 50, left: 10};
// set the inner size of chart
const innerWidth = width - margin.right - margin.left;
const innerHeight = height - margin.top - margin.bottom;

let svg = d3.select('#my_radar_diagram')
    .append('svg')
        .attr('width', width)
        .attr('height', height)
let plotG = svg
    .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

// input data
let dataset_path = "spotify_data.csv";
let csv_dataset = [];

let radialScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 250]);
let counter = 0;
let ticks = [0.2, 0.4, 0.6, 0.8, 1.0];
let features = ["valence", "energy", "acousticness", "instrumentalness", "speechiness", "mode", "danceability"];

let sankey_counter = 0;
let stack_counter = 0;

const update_gerne_button = document.querySelector("#update_gerne_button");
update_gerne_button.addEventListener("click", onclick_gerne_button);

const update_artist_button = document.querySelector("#update_artist_button");
update_artist_button.addEventListener("click", onclick_artist_button);

const update_stack_gerne_button = document.querySelector("#update_stack_gerne_button");
update_stack_gerne_button.addEventListener("click", onclick_stack_gerne_button);

let stacked_bar_data = [];

function onclick_gerne_button(){
    counter = counter + 5;
    if(counter >= avg_data.length){
        counter = 0;
    }
    final_data = avg_data.slice(counter, counter + 5);
    renderRadar(final_data);
}

function onclick_artist_button(){
    sankey_counter = sankey_counter + 10;
    if(sankey_counter >= 31437){
        sankey_counter = 0;
    }
    let sankey_data = sankey_data_generator(csv_dataset, sankey_counter, sankey_counter + 10);
    randerSankey(sankey_data);
}

function onclick_stack_gerne_button(){
    stack_counter = stack_counter + 10;
    if(stack_counter >= stacked_bar_data.length){
        stack_counter = 0;
    }
    stacked_bar_plot(stacked_bar_data.slice(stack_counter, stack_counter + 10));
}


d3.csv(dataset_path).then(function(data){
    console.log(data);
    csv_dataset = data;
    avg_data = radar_data_generator(data);
    final_data = avg_data.slice(0, 5);
    renderRadar(final_data);

    let sankey_data = sankey_data_generator(data, 0, 10);
    randerSankey(sankey_data);

    let stacked_bar_data = stacked_bar_data_generator(data);
    stacked_bar_plot(stacked_bar_data.slice(0, 10));
})

function radar_data_generator(data){
    // count the average of valence, energy, and tempo for each track gerne using rollup
    let rollup_data = d3.rollup(data, function(v){
        return {
            valence: d3.mean(v, d => d.valence),
            energy: d3.mean(v, d => d.energy),
            acousticness: d3.mean(v, d => d.acousticness),
            instrumentalness: d3.mean(v, d => d.instrumentalness),
            speechiness: d3.mean(v, d => d.speechiness),
            mode: d3.mean(v, d => d.mode),
            danceability: d3.mean(v, d => d.danceability)
        }
    }, d => d.track_genre);
    // convert the map to array
    let avg_data = Array.from(rollup_data, ([key, value]) => ({key, value}));
    return avg_data;
}

function sankey_data_generator(data, start, end){
    // generate the sankey data according to the artist and key
    // set artist as source and key as target
    // count the number of tracks for each artist and key
    let rollup_data = d3.rollup(data, v => v.length, d => d.artists, d => d.key);
    // console.log(rollup_data);
    let sankey_data = {"nodes": [], "links": []};
    let nodes = [];
    let links = [];
    let artist_names = Array.from(rollup_data.keys());
    let track_keys = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    // let track_keys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"]
    // console.log(track_keys)
    // generate nodes
    // get 10 artists
    artist_names = artist_names.slice(start, end);
    // console.log(artist_names.length)
    artist_names.forEach(name => {
        nodes.push({"name": name});
    })
    track_keys.forEach(key => {
        nodes.push({"name": key});
    })
    console.log(nodes);
    // initialize links
    artist_names.forEach(name => {
        track_keys.forEach(key => {
            links.push({"source": name, "target": key, "value": 0});
        })
    })
    console.log(links);
    // generate links
    rollup_data.forEach((value, key, map) => {
        let artist_name = key;
        let key_count = value;
        // get each key and value from map key_count
        key_count.forEach((value, key, map) => {
            let track_key = key;
            let track_count = value;
            // find the link with the same source and target
            // console.log(track_key);
            // console.log(artist_name);
            links.forEach(link => {
                if(link.source == artist_name && link.target == track_key){
                    link.value = track_count;
                }
            })
        })
    })
    // console.log(links);
    sankey_data.nodes = nodes;
    // sankey_data.nodes.sort(function(a, b){
    //     if (a.name < b.name) {return 1;}
    //     if (a.name > b.name) {return -1;}
    //     // return a.name - b.name;
    // })
    // console.log("sort:", sankey_data.nodes)
    sankey_data.links = links;
    console.log("here:", sankey_data);

    // convert node name into index
    let nodes_list = sankey_data.nodes.map(function(d){return d.name;});
    sankey_data.links.forEach(function (d, i) {
        sankey_data.links[i].source = nodes_list.indexOf(sankey_data.links[i].source);
        sankey_data.links[i].target = nodes_list.indexOf(sankey_data.links[i].target);
    });
    return sankey_data;
}


function stacked_bar_data_generator(data){
    let preprocess_data = []
    // turn popularity into 5 bins
    data.forEach(d => {
        if(d.popularity <= 20){
            preprocess_data.push({"gerne": d.track_genre,"track": d.track_name, "popularity": 0});
        }
        else if(d.popularity <= 40){
            preprocess_data.push({"gerne": d.track_genre,"track": d.track_name, "popularity": 1});
        }
        else if(d.popularity <= 60){
            preprocess_data.push({"gerne": d.track_genre,"track": d.track_name, "popularity": 2});
        }
        else if(d.popularity <= 80){
            preprocess_data.push({"gerne": d.track_genre,"track": d.track_name, "popularity": 3});
        }
        else{
            preprocess_data.push({"gerne": d.track_genre,"track": d.track_name, "popularity": 4});
        }
    })
    // console.log(preprocess_data)
    // count the number of tracks for each artist and popularity
    let stacked_rollup_data = d3.rollup(preprocess_data, v => v.length, d => d.gerne, d => d.popularity);
    // append the objects containing artist name and count of each popularity
    stacked_rollup_data.forEach((value, key, map) => {
        let tmp_entry = {"0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "name": key};
        value.forEach((value, key, map) => {
            tmp_entry[key] = value;
        })
        stacked_bar_data.push(tmp_entry);
    });
    console.log(stacked_bar_data);
    return stacked_bar_data;
}

function renderRadar(data){
    // remove all the previous elements
    plotG.selectAll("*").remove();
    
    plotG.selectAll("circle")
    .data(ticks)
    .join(
        enter => enter.append("circle")
            .attr("cx", width / 2)
            .attr("cy", height / 2)
            .attr("fill", "none")
            .attr("stroke", "gray")
            .attr("r", d => radialScale(d))
    );

    plotG.selectAll(".ticklabel")
    .data(ticks)
    .join(
        enter => enter.append("text")
            .attr("class", "ticklabel")
            .attr("x", width / 2 + 5)
            .attr("y", d => height / 2 - radialScale(d))
            .text(d => d.toString())
    );

    let featureData = features.map((f, i) => {
        let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
        return {
            "name": f,
            "angle": angle,
            "line_coord": angleToCoordinate(angle, 1),
            "label_coord": angleToCoordinate(angle, 1.1)
        };
    });
    
    // draw axis line
    plotG.selectAll("line")
        .data(featureData)
        .join(
            enter => enter.append("line")
                .attr("x1", width / 2)
                .attr("y1", height / 2)
                .attr("x2", d => d.line_coord.x)
                .attr("y2", d => d.line_coord.y)
                .attr("stroke","black")
        );
    
    // draw axis label
    plotG.selectAll(".axislabel")
        .data(featureData)
        .join(
            enter => enter.append("text")
                .attr("x", d => d.label_coord.x)
                .attr("y", d => d.label_coord.y)
                .text(d => d.name)
        );

    function angleToCoordinate(angle, value){
        let x = Math.cos(angle) * radialScale(value);
        let y = Math.sin(angle) * radialScale(value);
        return {"x": width / 2 + x, "y": height / 2 - y};
    }
    
    function getPathCoordinates(data_point){
        let coordinates = [];
        for (var i = 0; i < features.length; i++){
            let ft_name = features[i];
            let angle = (Math.PI / 2) + (2 * Math.PI * i / features.length);
            coordinates.push(angleToCoordinate(angle, data_point[ft_name]));
        }
        return coordinates;
    }
    
    let line = d3.line()
        .x(d => d.x)
        .y(d => d.y);
    let color_func = d3.scaleOrdinal().domain(data.map(d=>d.key)).range(d3.schemeSet3);
    // iterate through each data point and append all colors into an array
    let colors = [];
    data.forEach(d => {
        colors.push(color_func(d.key));
    });

    // tooltip events
    const mouseover = function(event, d) {
        d3.select(this)
            // .style("stroke", "black")
            .style("opacity", .9)
    }

    const mouseleave = function(event, d) {
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.4)
    }

    plotG.selectAll("path")
    .data(data.map(d => d.value))
    .join(
        enter => enter.append("path")
            .datum(d => getPathCoordinates(d))
            .attr("d", line)
            .attr("stroke-width", 3)
            .attr("stroke", (_, i) => colors[i])
            .attr("fill", (_, i) => colors[i])
            .attr("stroke-opacity", 1)
            .attr("opacity", 0.4)
    )
    .on("mouseover", mouseover)
    .on("mouseleave", mouseleave)

    // draw legend
    let legend = plotG.selectAll(".legend")
        .data(data.map(d => d.key))
        .join(
            enter => enter.append("g")
                .attr("class", "legend")
                .attr("transform", (d, i) => `translate(0, ${i * 20})`)
        );
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", (_, i) => colors[i]);
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .text(d => d);
}

const sankey_width = 1400; const sankey_height = 1000;

let sankey_svg = d3.select("#my_sankey_diagram")
    .append("svg")
        .attr("width", sankey_width)
        .attr("height", sankey_height)
let sankey_plotG = sankey_svg
    .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

function randerSankey(sankeydata){
    // remove all the previous elements
    sankey_plotG.selectAll("*").remove();

    // console.log(sankeydata);
    // map the key idnex to key name
    let key_map = new Map();
    key_map.set(0, "C"); key_map.set(1, "C#"); key_map.set(2, "D");
    key_map.set(3, "D#"); key_map.set(4, "E"); key_map.set(5, "F");
    key_map.set(6, "F#"); key_map.set(7, "G"); key_map.set(8, "G#");
    key_map.set(9, "A"); key_map.set(10, "A#"); key_map.set(11, "B");

    // draw the sankey diagram according to graph
    var sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(10)
        .size([innerWidth, innerHeight]);

    var path = sankey.links();
    graph = sankey(sankeydata);
    console.log("graph:", graph);

    const sankey_color = d3.scaleOrdinal()
    .domain(["artist", "key"])
    .range(["#e41a1c","#377eb8"]);

    // add in the links
    var link = sankey_plotG.append("g").selectAll("link")
        .data(graph.links).enter()
        .append("path")
            .attr("class", "link")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function(d) {
                return d.width;
            });

    // add the link titles
    link.append("title").text(function(d) {
        return d.source.name + " → " + key_map.get(d.target.name) + "\n" + d.value;
    });

    // add in the nodes
    let node = sankey_plotG.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(
        d3
            .drag()
            .subject(function(d) {
                return d;
            })
            .on("start", function() {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove)
        );

        console.log(node);   

    // sort the nodes' y position according to the index
    let prev_y_key = 0;
    let prev_y_artist = 0;
    node._groups[0].forEach(function(d, i) {
        if(typeof(d.__data__.name) == "number"){
            // console.log(d.__data__.name, d.__data__.y0);
            let height = d.__data__.y1 - d.__data__.y0;
            d.__data__.y0 = prev_y_key;
            d.__data__.y1 = d.__data__.y0 + height;
            prev_y_key = d.__data__.y1 + 10;
        }
        else{
            // console.log(d.__data__.name, d.__data__.y0);
            let height = d.__data__.y1 - d.__data__.y0;
            d.__data__.y0 = prev_y_artist;
            d.__data__.y1 = d.__data__.y0 + height;
            prev_y_artist = d.__data__.y1 + 10;
        }
    })

    // add the rectangles for the nodes
    node
        .append("rect")
            .attr("x", function(d) {
                return d.x0;
            })
            .attr("y", function(d, i) {
                // console.log(d.name, d.y0);
                return d.y0;
            })
            .attr("height", function(d) {
                d.rectHeight = d.y1 - d.y0;
                return d.y1 - d.y0;
            })
            .attr("width", sankey.nodeWidth())
            .style("fill", function(d) {
                if (typeof(d.name) == "number"){
                    return sankey_color("key");
                }
                else{
                    return sankey_color("artist");
                }
            })
            .attr("stroke", "#000")
            // .append("title")
            //     .text(function(d) {
            //         return d.value;
            //     });

    // add in the title for the nodes
    node
    .append("text")
        .attr("x", function(d) {
            return d.x0 - 6;
        })
        .attr("y", function(d) {
            return (d.y1 + d.y0) / 2;
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(function(d) {
            return key_map.get(d.name) || d.name;
        })
        .filter(function(d) {
            return d.x0 < width / 2;
        })
        .attr("x", function(d) {
            return d.x1 + 6;
        })
        .attr("text-anchor", "start");

    sankey.update(graph);
    link.attr("d", d3.sankeyLinkHorizontal());

    // the function for moving the nodes
    function dragmove(d) {
        // console.log(d);
        d3.select(this)
            .select("rect")
            .attr("y", function(n) {
                n.y0 = Math.max(0, Math.min(n.y0 + d.dy, height - (n.y1 - n.y0)));
                n.y1 = n.y0 + n.rectHeight;
                return n.y0;
            })
            .attr("x", function(n) {
                n.x0 = n.x0 + d.dx;
                n.x1 = n.x1 + d.dx;
                return n.x0;
            });

        d3.select(this)
            .select("text")
            .attr("x", function(d) {
            return d.x0 - 6;
            })
            .attr("y", function(d) {
                return (d.y1 + d.y0) / 2;
            })
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text(function(d) {
                return key_map.get(d.name) || d.name;
            })
            .filter(function(d) {
                return d.x0 < width / 2;
            })
            .attr("x", function(d) {
                return d.x1 + 6;
            })
            .attr("text-anchor", "start");
        sankey.update(graph);
        link.attr("d", d3.sankeyLinkHorizontal());
    }
}

const stack_width = 1500; const stack_height = 1000;

let stack_svg = d3.select("#my_stacked_bar_diagram")
    .append("svg")
        .attr("width", stack_width)
        .attr("height", stack_height)
let stack_plotG = stack_svg
    .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

function stacked_bar_plot(sorted_dataset){
    // remove previous plot
    stack_plotG.selectAll('*').remove();

    let bar_feature = ["0", "1", "2", "3", "4"];

    let bar_color = d3.scaleOrdinal()
        .domain(bar_feature)
        .range(['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026']);

    // console.log("inside:", sorted_dataset);
    
    // create stacked data
    const stack_generator = d3.stack()
        .keys(bar_feature)
        .order(d3.stackOrderNone) 
        .offset(d3.stackOffsetNone);
    const stack_data = stack_generator(sorted_dataset);

    // check the max value for range of x axis
    let max_value = 0;
    stack_data.forEach(function(d){
        d.forEach(function(row){
            if(row[1] > max_value){
                max_value = row[1];
            }
        })
    })
    // console.log(max_value)

    const y_text_space = 130;
    // x axis
    const x_scale = d3.scaleLinear()
        .domain([0, max_value])
        .range([y_text_space, stack_width - margin.right - margin.left - 10]);
    const x_axis_bot = d3.axisBottom(x_scale)
        .tickSize(innerHeight)
        .tickPadding(5);
    const x_axis_top = d3.axisTop(x_scale)
        .tickSize(0)
        .tickPadding(2);
    stack_plotG
        .append('g')
        .call(x_axis_top)
    stack_plotG
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
    stack_plotG
        .append('g')
        .attr("transform", `translate(${y_text_space}, 0)`)
        .call(y_axis)
        .style("font-size", "18px");

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
        // console.log(d);
        // get the original data of same school
        obj = stacked_bar_data.filter(function(row){
            return row.name === d.data.name;
        })
        // get the selected attribute
        attr = Object.keys(d.data).find(key => d.data[key].toFixed(2) === (d[1] - d[0]).toFixed(2));
        let pop = "";
        if(attr === '0') pop = "0-20%";
        else if(attr === '1') pop = "20-40%";
        else if(attr === '2') pop = "40-60%";
        else if(attr === '3') pop = "60-80%";
        else pop = "80-100%"; 
        tooltip
            .html(pop + " popularity: " + (obj[0][attr]).toFixed(0) + ' songs')
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
    stack_plotG
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
                    .style("stroke", "black")
                    .on("mouseover", mouseover)
                    .on("mousemove", mousemove)
                    .on("mouseleave", mouseleave);
}