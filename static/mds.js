function createMDSPlot(data) {
    // console.log(data)
    d3.select("#mdsplot").selectAll("*").remove();
    var update_pcp = false;

    var margin = { top: 30, right: 60, bottom: 30, left: 80 },
        width = 750 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
    //console.log(width)
    var zoom = d3version6.zoom()
        .on('zoom', function (event) {
            d3.select('#mdsplot').select('g')
                .attr('transform', event.transform);
        });

    var top_padding = 75;
    var graphName;

    var lables = {
    'state': 'State','county':'County','total_population':'Total Population',
    'percent_homeowners':'% Homeowners',
    'percent_below_poverty':'% Below Poverty',
    'percent_fair_or_poor_health':'% Poor Health',
    'percent_frequent_physical_distress':'% Frequent Physical Distress',
    'percent_adults_with_obesity':'% Adults With Obesity',
    'percent_frequent_mental_distress':'% Frequent Mental Distress',
    'percent_minorities':'% Minorities',
    'percent_insufficient_sleep':'% Insufficient Sleep',
    'per_capita_income':'Per Capita Income',
    'percent_below_poverty':'% Below Poverty Line',
    'percent_unemployed_CDC':'% Unemployed',
    'percent_excessive_drinking_cat':'Excessive Drinking in Adults',
    'population_density_per_sqmi_cat':'Population Density',
    'life_expectancy' :'Life Expectancy',
    'percent_limited_access_to_healthy_foods':'% Limited Access to Healthy Food',
    'percent_no_highschool_diploma':'% No High School Diploma',
    'percent_severe_housing_cost_burden':'% Housing Cost Burden',
    'percent_vaccinated':'% Vacinated',
    'high_school_graduation_rate':'High School Graduation Rate'
    }
    
    // Canvas
    var canvas = d3.select("#mdsplot")
                .append("svg")
                .attr("width", width + 2 * margin.left)
                .attr("height", height + 2 * margin.top)
                .append("g")
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
    //console.log("THAAAAT")
//console.log(data);
var x = data.x;
var y = data.y;
var cols = data.cols;
//var labels = data.labels;

var scatter_data = [];

for (i = 0; i < x.length; i++) {
    scatter_data.push(
        {
            x: x[i],
            y: y[i],
            col: cols[i],
        }
    )
};

x_max_value = d3.max(x);
x_min_value = d3.min(x)
y_max_value = d3.max(y)
y_min_value = d3.min(y)

//console.log(x_min_value, y_min_value);
//console.log(x_max_value, y_max_value);

// Scaling
// X Axis
var widthScale = d3.scaleLinear()
    .domain([x_min_value+(0.2*x_min_value), x_max_value+(0.2*x_max_value)])
    .range([0, width]);
canvas.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(widthScale));
canvas.append("g")
    .attr("transform", "translate(0," + 0 + ")")
    .call(d3.axisBottom(widthScale));

// Add Y axis
var heightScale = d3.scaleLinear()
    .domain([y_min_value+(0.2*y_min_value), y_max_value+(0.2*y_max_value)])
    .range([height, 0]);

canvas.append("g")
    .call(d3.axisLeft(heightScale))
    .attr("transform", "translate(" + width + "," + 0 + ")");
canvas.append("g")
    .call(d3.axisLeft(heightScale))
    .attr("transform", "translate(" + 0 + "," + 0 + ")");

selectedPoints = [];
var points = [];
var dots = canvas.append('g')
    .selectAll("dot")
    .data(scatter_data)
    .enter()
    .append("circle")
    .attr("cx", function (d) { return widthScale(d.x); })
    .attr("cy", function (d) { return heightScale(d.y); })
    .attr("r", 8)
    .on("click", function(d) {
    // When a circle is clicked, store its data if not clicked before

        //console.log(d.col)
        d3.json(`/featuredata?feature=${d.col}`, function (error, data) {
            console.log(data);
            //console.log(data.county_data);
            //console.log(data.county_data.length)
            checkBoxChart = d3.select('input[name="topWrst"]').node().checked;
            if (checkBoxChart == false) {
                updateBarChart(data.top10bestcountyfeature, d.col);
            } else {
                updateBarChart(data.top10worstcountyfeature, d.col);
            }
            
        })

        points.push([widthScale(d.x), heightScale(d.y)]);
        //console.log(points);
        if (points.length == 2) {
            canvas.append('line')
                .style("stroke", "green")
                .attr("x1", points[0][0])
                .attr("y1", points[0][1])
                .attr("x2", points[1][0])
                .attr("y2", points[1][1])
                .attr("class", "line_mds");

            points.shift();
        }

        if((selectedPoints.indexOf(d) == -1)){
            selectedPoints.push(d)
            d3.select(this).classed("highlight", true);
        }
        if(selectedPoints.length == 5){
            //console.log(selectedPoints);
            update_pcp = true;

            var attri = [];
            
            for(var i = 0; i < selectedPoints.length; i++){
                attri.push(selectedPoints[i]['col']);
            }
            //console.log(selectedPoints[0]['col'])
            //console.log(attri)
            d3.json('/pcpdata', function (error, data) {
                data = JSON.parse(data.pcpData);
                //console.log(data);
                createPCPPlot(data, attri)
            });
            
            dots.classed("highlight", false);
            d3.selectAll(".line_mds").remove();
            points = [];
            selectedPoints = [];
        }
        


        //console.log(update_pcp);
        //console.log(selectedPoints)
    }
        )
    .attr("fill", "red");

    canvas.selectAll(".text-label")
    .data(scatter_data)
    .enter()
        .append("text")
        .classed("text-label", true)
        .attr("x", function (d) { return widthScale(d.x + 0.01); })
        .attr("y", function (d) { return heightScale(d.y + 0.01); })
        .text(function (d) { return lables[d.col]; })
        .attr('fill', "purple");


canvas.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .text("Dimension 1");

canvas.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "middle")
    .attr("x", -height / 2)
    .attr("y", -60)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Dimension 2");
}

