// BAR GRAPH  (Upwards Oriented)  
// d3.json('/barchart/top10county', function (data) {
function updateBarChart(data, lable) {
    // console.log(checkBoxChart);
    console.log(data);
    console.log(lable)
    d3.select('#bar_chart').selectAll("*").remove()
    var margin = { top: 30, right: 30, bottom: 30, left: 90 },
        width = 460 - margin.left - margin.right,
        height = 250 - margin.top - margin.bottom;

    var left_padding = 250;
    var top_padding = 75;

    var counts = {};
    var keys = [];
    var values = [];

    for (var i = 0; i < data.length; i++) {
        keys.push(Object.keys(data[i])[0]);
        values.push(Object.values(data[i])[0]);
    }

    data_list = [];

    for (var i = 0; i < keys.length; i++) {
        data_list.push(
            {
                'key': keys[i],
                'value': values[i]
            }
        );


    };

    max_val = Math.max.apply(Math, values);

    // Scaling values
    var widthScale = d3.scaleBand()
        .domain(keys)
        .range([0, width - margin.left]);

    var heightScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.top, 0]);

    var color = d3.scaleLinear()
        .domain([max_val - 5, max_val])
        .range(['#386CB0', '#F0027F']);


    // x and y axis
    var x_axis = d3.axisBottom().scale(widthScale);
    var y_axis = d3.axisLeft().scale(heightScale);

    // Canvas to display graph
    var canvas = d3.select("#bar_chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append('g')
        .attr("class", "svgb")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // Plotting the bars
    var bars = canvas.selectAll("rect")
        .data(data_list)
        .enter()
        .append("rect")
        .attr("x", function (d) { return widthScale(d.key); })
        .attr("y", function (d) { return heightScale(d.value); })
        .attr("width", widthScale.bandwidth() * 0.5)
        .attr("height", function (d) { return height - margin.top - heightScale(d.value); }) //length of bars
        .attr("fill", function (d) { return color(d.value); });
        
    
    bars.transition()
    .duration(1000)
    .delay(function (d, i) { return (i * 100) });

    bars.on("mouseover", highlightBar).on("mouseout", unhighlightBar);

    bars.on("click", showStats);
    
    function showStats(d){
        d3.json("/countyStateCode", function (error, us) {
            req_id = d.id
            for (var i = 0; i < us.fips.length; i++) {
                if (us.fips[i] == req_id) {
                    county_name = us.name[i];
                    break;
                }
            }
            //console.log(county_name);
            d3.json(`/countydata?county=${d.key}`, function (error, data) {
                console.log(data);
                console.log(data.county_data);
                console.log(data.county_data.length)
                if(data.county_data.length > 0){
                    updateBarChart(data.county_data, data.county_name);
                }
                
            })
        });
    }

    function highlightBar(d) 
    {
        d3.select(this).style("fill", "green")
        d3.select(this).append('title').text(d.value);

    }

    function unhighlightBar(d) 
    {
        d3.select(this).style("fill", color(d.value))

    }

    canvas.append('g')
        .attr('transform', 'translate(0,' + (height - margin.top) + ')')
        .call(x_axis)
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    if(data.length > 4){
        canvas.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", (width / 2)-60)
        .attr("y", height + 15)
        .text("County");
    }
    else{
        canvas.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "middle")
        .attr("x", (width / 2)-60)
        .attr("y", height + 10)
        .text("Sub-Categories");
    }
    

    canvas.append('g')
        .call(y_axis);

    canvas.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("x", -height / 2)
        .attr("y", -60)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("Score");

    canvas.append("text")
        .attr("x", (width / 2) -60)             
        .attr("y", -10)
        .attr("text-anchor", "middle")  
        .style("font-size", "10px") 
        // .style("text-decoration", "underline")  
        .text(lable + " Bar Chart");

    // });

}