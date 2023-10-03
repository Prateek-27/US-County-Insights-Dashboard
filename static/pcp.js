var brushedData = [];

/*Function to draw PCP plot*/
function createPCPPlot(data, attributes) {
    console.log(data);
    //console.log(attributes);
    
    d3.selectAll(".svg_pcp").remove();

    var margin = { top: 30, right: 60, bottom: 30, left: 40 },
        width = 950 - margin.left - margin.right,
        height = 260 - margin.top - margin.bottom;

    var x = d3.scalePoint().range([0, width]).padding(1);
    var y = {};
    var dragging = {};
    var line = d3.line();
    var axis = d3.axisLeft();

    var svg = d3.select('#pcpplot')
        .append("svg")
        .attr("class", "svg_pcp")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        // .style("width","100%")
        // .style("height", "100%")
        // .attr("transform",
        //     "translate(" + margin.left + "," + (margin.top - 50) + ")");

    var g = svg.append("g")
        .attr("transform", "translate(" + -50 + "," + margin.top + ")");

    dimensions = d3.keys(data[0]).filter(function (d) {
        //console.log(d);
        return d != "cluster"
    });

    if (attributes.length > 0) {
        dimensions = attributes;
    }
    else{
        dimensions = ['percent_fair_or_poor_health', 'per_capita_income', 'percent_no_highschool_diploma', 'high_school_graduation_rate', 'percent_vaccinated'];
    }

    for (i in dimensions) {
        attrName = dimensions[i]
        y[attrName] = d3.scaleLinear()
            .domain(d3.extent(data, function (d) { return +d[attrName]; }))
            .range([height + 20, 0])
    }
    x.domain(dimensions);

    var color = d3.scaleOrdinal(d3.schemeAccent);

    background = g.append("g")
        .attr("class", "background_pcp")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("class", "path_pcp")
        .attr("d", path);

    foreground = g.append("g")
        .attr("class", "foreground_pcp")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "path_pcp")
        .style("stroke", function (d) {
            return color(d.cluster + 1);
        });

    /* Add a group element for each dimension*/
    g = g.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function (d) { 
            // console.log(d);
            return "translate(" + x(d) + ")"; 
        })
        .call(d3.drag()
            .subject(function (d) { return { x: x(d) }; })
            .on("start", function (d) {
                dragging[d] = x(d);
                background.attr("visibility", "hidden");
            })
            .on("drag", function (d) {
                dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                foreground.attr("d", path);
                dimensions.sort(function (a, b) { return position(a) - position(b); });
                x.domain(dimensions);
                g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
            })
            .on("end", function (d) {
                delete dragging[d];
                transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                transition(foreground)
                    .attr("d", path);
                background
                    .attr("d", path)
                    .transition()
                    .delay(500)
                    .duration(0)
                    .attr("visibility", null);
            })
        )

    /* Add an axis and title*/
    g.append("g")
        .attr("class", "axis_pcp")
        .each(function (d) { d3.select(this).call(axis.scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .style("font-size", "10px")
        .style("fill", "black")
        .attr("y", -9)
        .attr("transform", "rotate(-10)")
        .style("font-weight", "bold")
        .text(function (d) { return d; });

    /*Add and store a brush for each axis*/
    g.append("g")
        .attr("class", "brush_pcp")
        .each(function (d) {
            d3.select(this)
                .call(y[d].brush = d3.brushY()
                    .extent([[-8, y[d].range()[1]], [8, y[d].range()[0]]])
                    .on("start", brushstart)
                    .on("brush", brush)
                );
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    /*Returns the path for a given data point*/
    function path(d) {
        return line(dimensions.map(function (p) {
            return [position(p), y[p](d[p])];
        }));
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    /*Handles a brush event, toggling the display of foreground lines*/
    function brush() {
        const actives = [];
        brushedData = [];

        /*filter brushed extents*/
        svg.selectAll('.brush_pcp')
            .filter(function (d) {
                return d3.brushSelection(this);
            })
            .each(function (d) {
                actives.push({
                    dimension: d,
                    extent: d3.brushSelection(this)
                });
            });
        
        
         if (actives.length > 0) {
            brushedData = [];
          // Print the selected range for each brushed dimension
          actives.forEach(function (brushObj) {
            var extent = brushObj.extent;
            var selectedRange;
      
           
              // For continuous variables (linear scales)
              selectedRange = extent.map(function (value) {
                return y[brushObj.dimension].invert(value);
              });
            
      
            var sortedRange = selectedRange.slice().sort(d3.ascending);
            console.log(brushObj.dimension + " " + sortedRange);
            
            brushedData = brushObj.dimension+" "+sortedRange[0]+" "+sortedRange[1]         

          });
        }

        // Update BAR 
        d3.json(`/brushfeaturedata?featurelist=${brushedData}`, function (error, data) {
            console.log(data);
            //console.log(data.county_data);
            //console.log(data.county_data.length)
            checkBoxChart = d3.select('input[name="topWrst"]').node().checked;
            if (checkBoxChart == false) {
                updateBarChart(data.top10bestcountyfeaturebrushed, "Top 10 based on Brushed feature");
                brushedData = [];
            } else {
                updateBarChart(data.top10worstcountyfeaturebrushed, "Worst 10 based on Brushed feature");
                brushedData = [];
            }
            
        })

        // Update BOX
        d3.json(`/brushboxdata?featurelist=${brushedData}`, function (error, data) {
            //data = JSON.parse(data);
            console.log(data);
            //console.log(data.state_pcp_data);
            BoxPlot(data)
            brushedData = [];
            //updateBarChart(data.top10instate, state_name);
        })

        console.log(brushedData);
    //     // Filter the data based on the brushed ranges
    //     var brushed = data.filter(function(d) {
    //     return actives.every(function(active) {
    //       return active.range[0] <= d[active.dimension] && d[active.dimension] <= active.range[1];
    //     });
    //   });
  
    //   // Update the brushedData array with the new brushed data points
    //   brushedData = brushed;
    //   console.log(brushedData);
        
        /*set un-brushed foreground line disappear*/
        foreground.style('display', function (d) {
            return actives.every(function (active) {
                const dim = active.dimension;


                return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim]) <= active.extent[1];
            }) ? null : 'none';
        });

        
        
    }
}