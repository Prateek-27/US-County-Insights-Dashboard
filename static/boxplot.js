//d3.json('/boxData', function (error, data) 
function BoxPlot(data){
    console.log(data);
    // Compute summary statistics used for the box:
    d3.select("#box_plot").selectAll("*").remove();
    d3.select("#selectButton").selectAll("*").remove();

    // set the dimensions and margins of the graph
    var margin = { top: 30, right: 230, bottom: 30, left: 80 },
        width = 740 - margin.left - margin.right,
        height = 260 - margin.top - margin.bottom;

    var categories = ['Health', 'QoL', 'Wealth', 'Education']
    //var feature = "Health"
    //var feature = "QoL"
    //var feature = "Wealth"
    // var feature = "Education"
    var feature = 'Health';
    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(categories)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

    updateBoxPLot(feature, data);
    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function (d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        // update(selectedOption)
        feature = selectedOption;
        updateBoxPLot(feature, data);
    })

    function updateBoxPLot(feature, data) {
        d3.select("#box_plot").selectAll("*").remove();

        var svg = d3.select("#box_plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        if (feature == "Health") {
            var data_final = data.health
        }
        else if (feature == "QoL") {
            var data_final = data.qol
        }
        else if (feature == "Wealth") {
            var data_final = data.wealth
        }
        else if (feature == "Education") {
            var data_final = data.education
        }


        data_sorted = []
        // console.log(Object.values(data_final[0])[0])
        for (var i = 0; i < data_final.length; i++) {
            data_sorted.push(Object.values(data_final[i])[0])
        }

        //console.log(data_sorted)

        var q1 = d3.quantile(data_sorted, .25)
        var median = d3.quantile(data_sorted, .5)
        var q3 = d3.quantile(data_sorted, .75)
        var interQuantileRange = q3 - q1
        var min = q1 - 1.5 * interQuantileRange
        var max = q1 + 1.5 * interQuantileRange

        // Show the Y scale
        var y = d3.scaleLinear()
            .domain([0, 100])
            .range([height, 0]);
        svg.call(d3.axisLeft(y))

        // a few features for the box
        var center = 200
        var width = 100

        // Show the main vertical line
        svg
            .append("line")
            .attr("x1", center)
            .attr("x2", center)
            .attr("y1", y(min))
            .attr("y2", y(max))
            .attr("stroke", "black")

        // Show the box
        svg
            .append("rect")
            .attr("x", center - width / 2)
            .attr("y", y(q3))
            .attr("height", (y(q1) - y(q3)))
            .attr("width", width)
            .attr("stroke", "black")
            .style("fill", "#69b3a2")

        // show median, min and max horizontal lines
        svg
            .selectAll("toto")
            .data([min, median, max])
            .enter()
            .append("line")
            .attr("x1", center - width / 2)
            .attr("x2", center + width / 2)
            .attr("y1", function (d) { return (y(d)) })
            .attr("y2", function (d) { return (y(d)) })
            .attr("stroke", "black")

        // Add individual points with jitter
        var jitterWidth = 50
        svg
            .selectAll("indPoints")
            .data(data_sorted)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return (center - jitterWidth / 2 + Math.random() * jitterWidth) })
            .attr("cy", function (d) { return (y(d)) })
            .attr("r", 2)
            .style("fill", "pink")
            .attr("stroke", "black")
            .attr("opacity", 0.1);
    }
}

