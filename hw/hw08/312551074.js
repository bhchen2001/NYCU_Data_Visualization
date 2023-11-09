// set the size of svg
const width = 1800; const height = 900;
const margin = {top: 10, right: 10, bottom: 50, left: 10};
// set the inner size of chart
const innerWidth = width - margin.right - margin.left;
const innerHeight = height - margin.top - margin.bottom;

let svg = d3.select('#my_sankey_diagram')
    .append('svg')
        .attr('width', width)
        .attr('height', height)
let plotG = svg
    .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

// input data
// from d3 version5, promise returned from d3.csv()
let dataset_path = "http://vis.lab.djosix.com:2023/data/car.data";
let keys = ['buying', 'maint', 'doors', 'persons', 'lugboot', 'safety', 'class'];
let key_set = [];
let new_data = [];
// var color = d3.scaleOrdinal(d3.schemeCategory10);
var formatNumber = d3.format(",.0f") // zero decimal places
var format = function(d) { return formatNumber(d); }
const color = d3.scaleOrdinal()
    .domain(keys)
    .range(["#e41a1c","#377eb8","#4daf4a","#984ea3","#ff7f00","#eb07c1", '#000000']);

d3.text(dataset_path).then(function(data){
    let header_data = 'buying,maint,doors,persons,lugboot,safety,class\n' + data;
    // console.log(header_data);
    sankeydata = {"nodes": [], "links": []};
    csv_data = d3.csvParse(header_data);
    // build the set of categories of each key
    keys.forEach(function(k){
        key_set.push(new Set(csv_data.map(function(d) { return d[k]; })));
    })
    console.log(key_set);
    // build the nodes for each key
    keys.forEach(function(k, i){
        key_set[i].forEach(function(d){
            sankeydata.nodes.push({"name" : k + '_' + d})
        })
    })
    console.log(sankeydata.nodes);
    // sankeydata.nodes.forEach(function(d, i){
    //     sankeydata.nodes[i] = {"name" : d.name};
    // })
    // initialze the links of each combination of keys
    sankeydata.nodes.forEach(function(d, i){
        sankeydata.nodes.forEach(function(dd, ii){
            // if((d.name.split('_')[0] == dd.name.split('_')[0]) || i >= ii) return;
            if(d.name.split('_')[0] === dd.name.split('_')[0]) return;
            console.log(d.name, dd.name)
            sankeydata.links.push({"source": d.name, "target": dd.name, "value": 0});
        })
    });

    console.log(sankeydata.links);
    // build the links for each node depend on the frequency
    csv_data.forEach(function(d){
        sankeydata.nodes.forEach(function(k, i){
            let attr1 = k.name.split('_')[0];
            let val1 = k.name.split('_')[1];
            sankeydata.nodes.forEach(function(kk, ii){
                if(i == ii) return;
                let attr2 = kk.name.split('_')[0];
                let val2 = kk.name.split('_')[1];
                if(d[attr1] == val1 && d[attr2] == val2){
                    sankeydata.links.forEach(function(l){
                        if((l.source == k.name && l.target == kk.name)){
                            l.value += 1;
                        }
                    })
                }
            })
        })
    })

    let new_sankeydata = [];
    sankeydata.links.forEach(function(d){
        idx_src = keys.indexOf(d.source.split('_')[0]);
        idx_des = keys.indexOf(d.target.split('_')[0]);
        if(idx_des - idx_src == 1){
            new_sankeydata.push(d);
        }
    })

    sankeydata.links = new_sankeydata;

    console.log(sankeydata.nodes);
    console.log(sankeydata.links);

    // return all element in graph.nodes store in array
    nodes_list = sankeydata.nodes.map(function(d){return d.name;});
    console.log(nodes_list);

    // loop through each link replacing the text with its index from node
    sankeydata.links.forEach(function (d, i) {
        sankeydata.links[i].source = nodes_list.indexOf(sankeydata.links[i].source);
        sankeydata.links[i].target = nodes_list.indexOf(sankeydata.links[i].target);
    });

    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    // sankeydata.nodes.forEach(function (d, i) {
    //     sankeydata.nodes[i] = { "name": d };
    // });
    console.log(sankeydata);
    drawPlot(sankeydata);
})

function drawPlot(sankeydata){
    console.log(sankeydata);
    // draw the sankey diagram according to graph
    var sankey = d3.sankey()
        .nodeWidth(36)
        .nodePadding(40)
        .size([innerWidth, innerHeight]);

    var path = sankey.links();
    graph = sankey(sankeydata);

    // add in the links
    var link = plotG.append("g").selectAll("link")
        .data(graph.links).enter()
        .append("path")
            .attr("class", "link")
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function(d) {
            return d.width;
            });

  // add the link titles
  link.append("title").text(function(d) {
    return d.source.name + " → " + d.target.name + "\n" + format(d.value);
  });

  // add in the nodes
  var node = plotG.append("g").selectAll(".node")
    .data(graph.nodes).enter()
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

  // add the rectangles for the nodes
  node
    .append("rect")
        .attr("x", function(d) {
        return d.x0;
        })
        .attr("y", function(d) {
        return d.y0;
        })
        .attr("height", function(d) {
        d.rectHeight = d.y1 - d.y0;
        return d.y1 - d.y0;
        })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) {
        return (d.color = color(d.name.split("_")[0]));
        })
        .attr("stroke", "#000")
        .append("title")
            .text(function(d) {
            return d.name + "\n" + format(d.value);
            });

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
        return d.name;
        })
        .filter(function(d) {
        return d.x0 < width / 2;
        })
        .attr("x", function(d) {
        return d.x1 + 6;
        })
        .attr("text-anchor", "start");

  // the function for moving the nodes
  function dragmove(d) {
    d3.select(this)
      .select("rect")
      .attr("y", function(n) {
        n.y0 = Math.max(0, Math.min(n.y0 + d.dy, height - (n.y1 - n.y0)));
        n.y1 = n.y0 + n.rectHeight;
        return n.y0;
      });

    d3.select(this)
      .select("text")
      .attr("y", function(n) {
        return (n.y0 + n.y1) / 2;
      });
    sankey.update(graph);
    link.attr("d", d3.sankeyLinkHorizontal());
  }
}