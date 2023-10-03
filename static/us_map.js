fetch('/usmapdata', {
    method: "GET",
    headers: {
        'Content-Type': 'application/json'
    },
}).then(function (response) {
    return response.json()
}).then(function (usdata) {
    // fetch('/countyStateCode')
    //     .then(function (response2) {
    //         return response2.json();
    //     }).then(function (countyCode) {
    //         createUSMap(usdata, countyCode)
    //     });
    createUSMap(usdata)
});

var stateSelected = false;
var stateName = "";

function createUSMap(us) {
    //console.log(us);
    document.getElementById('state_div').innerHTML = null;
    document.getElementById('county_div').innerHTML = null;
    d3.selectAll(".usa_map").remove();
    var margin = { top: 30, right: 30, bottom: 30, left: 60 },
        width = 700 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
    var centered;
    // The svg
    svg = d3.select("#us_map").append("svg")
        .attr("class", "usa_map")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform)
        }))
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var projection = d3.geoAlbersUsa()
        .scale(800)
        .translate([width / 2, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    svg.append("rect")
        .attr("class", "background")
        .attr("width", width)
        .attr("height", height)
        .on("click", clicked);

    //svg.append("title").text(function () {console.log(us); return "HELLO"});

    var g = svg.append("g");

    g.append("g")
        .attr("id", "counties")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.counties).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "county-boundary")
        .on("click", countyclicked)
        .on("mouseover", countyin)


    g.append("g")
        .attr("id", "states")
        .selectAll("path")
        .data(topojson.feature(us, us.objects.states).features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "state")
        .on("click", clicked)
        .on("mouseover", statein)


    g.append("path")
        .datum(topojson.mesh(us, us.objects.states, function (a, b) { return a !== b; }))
        .attr("id", "state-borders")
        .attr("d", path);


    function clicked(d) {
        stateSelected = true;
        var x, y, k;
        //console.log(d)
        if (d && centered !== d) {
            var centroid = path.centroid(d);
            x = centroid[0];
            y = centroid[1];
            k = 4;
            centered = d;
        } else {
            x = width / 2;
            y = height / 2;
            k = 1;
            centered = null;
        }

        g.selectAll("path")
            .classed("active", centered && function (d) { return d === centered; });

        g.transition()
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .style("stroke-width", 1.5 / k + "px");

        
        
        // UPDATE THE BARS
        d3.json("/stateCode", function (error, us) {
                req_id = d.id
                for (var i = 0; i < us.fips.length; i++) {
                    if (us.fips[i] == req_id) {
                        state_name = us.name[i];
                        stateName = state_name;
                        document.getElementById('state_div').innerHTML = "State: "+stateName;
                        break;
                    }
                }
                //console.log(county_name);
                d3.json(`/statedata?state=${state_name}`, function (error, data) {
                    console.log(data);
                    console.log(data.top10instate);
                    checkBoxChart = d3.select('input[name="topWrst"]').node().checked;
                    if (checkBoxChart == false) {
                        updateBarChart(data.top10instate, state_name);
                    } else {
                        updateBarChart(data.worst10instate, state_name);
                    }
                    //updateBarChart(data.top10instate, state_name);
                })
            });
        
        // UPDATE THE PCP
        d3.json("/stateCode", function (error, us) {
            req_id = d.id
            for (var i = 0; i < us.fips.length; i++) {
                if (us.fips[i] == req_id) {
                    state_name = us.name[i];
                    stateName = state_name;
                    break;
                }
            }
            //console.log(county_name);
            d3.json(`/statedataPCP?state=${state_name}`, function (error, data) {
                //console.log(data.state_pcp_data.pcpData);
                data = JSON.parse(data.state_pcp_data.pcpData);
                console.log(data);
                //console.log("HELOOOOOO")
                //console.log(data.state_pcp_data);
                createPCPPlot(data, [])
                //updateBarChart(data.top10instate, state_name);
            })
        });

        // BOX PLOT UPDATE
        d3.json("/stateCode", function (error, us) {
            req_id = d.id
            for (var i = 0; i < us.fips.length; i++) {
                if (us.fips[i] == req_id) {
                    state_name = us.name[i];
                    stateName = state_name;
                    break;
                }
            }
            //console.log(county_name);
            d3.json(`/boxDataState?state=${state_name}`, function (error, data) {
                //data = JSON.parse(data);
                console.log(data);
                //console.log(data.state_pcp_data);
                BoxPlot(data)
                //updateBarChart(data.top10instate, state_name);
            })
        });
       

    }

    function countyclicked(d) {
        d3.select(".selected").style("fill", "#AAAAAA");
        d3.select(".selected").classed("selected", false);
        d3.select(this).classed("selected", true);
        d3.select(this).style("fill","#F0027F")

        d3.json("/countyStateCode", function (error, us) {
            req_id = d.id
            for (var i = 0; i < us.fips.length; i++) {
                if (us.fips[i] == req_id) {
                    county_name = us.name[i];
                    document.getElementById('county_div').innerHTML = "County: "+county_name;
                    break;
                }
            }
            //console.log(county_name);
            d3.json(`/countydata?county=${county_name}`, function (error, data) {
                console.log(data);
                console.log(data.county_data);
                updateBarChart(data.county_data, data.county_name);
            })
        });
        
        // UPDATE THE PCP
        d3.json("/stateCode", function (error, us) {
            req_id = d.id
            for (var i = 0; i < us.fips.length; i++) {
                if (us.fips[i] == req_id) {
                    state_name = us.name[i];
                    stateName = state_name;
                    break;
                }
            }
            
            d3.json("/countyStateCode", function (error, us) {
                req_id = d.id
                for (var i = 0; i < us.fips.length; i++) {
                    if (us.fips[i] == req_id) {
                        county_name = us.name[i];
                        break;
                    }
                }
            
            //console.log(county_name);
            
            console.log(state_name, county_name);

            d3.json(`/countydataPCP?state=${state_name}&county=${county_name}`, function (error, data) {
                data = JSON.parse(data.state_pcp_data.pcpData);
                console.log(data);
                //console.log(data.state_pcp_data);
                createPCPPlot(data, [])
                //updateBarChart(data.top10instate, state_name);
            })
        })
        });
    }
    
    function statein(d) {
        var that = this;
        stateinlable(d,that)
    }

    function stateinlable(d,that){
        var state_name;
        d3.json("/stateCode", function (error, us) {
            req_id = d.id
            //console.log(req_id);
            for (var i = 0; i < us.fips.length; i++) {
                if (us.fips[i] == req_id) {
                    state_name = us.name[i];
                    d3.select(that).append('title').text(state_name);
                }
            }
        });
       
    }

    function countyin(d) {
        var that = this;
        countyinlable(d,that)
    }

    function countyinlable(d,that){
        var county_name;
        d3.json("/countyStateCode", function (error, us) {
            req_id = d.id
            for (var i = 0; i < us.fips.length; i++) {
                if (us.fips[i] == req_id) {
                    county_name = us.name[i];
                    d3.select(that).append('title').text(county_name);
                }
            }
        });
       
    }


}