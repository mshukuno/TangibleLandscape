/**
chart_one.js
*/

//d3.select("#svg-sr").select("svg").remove();
//var jsonFile = "data/results2.json";
var dataIdList = {
    "nodo": "n_dead_oaks",
    "podo": "percent_dead_oaks",
    "ia": "infected_area_ha",
    "ms": "money_spent",
    "at": "area_treated_ha",
    "ppo": "price_per_oak"
};
var hideEle = [];
var colorSelection = [
	"rgba(238, 221, 153, .8)",
	"rgba(77, 182, 172, 1)",
	"rgba(129, 199, 132, 1)",
	"rgba(255, 202, 40, 1)",
	"rgba(156, 204, 101, 1)",
	"#E0E0E0",
	"rgba(205, 220, 57, 1)"
];

var legendRect = 15,
    legendSpacing = 15,
    refcolors = {}


var yLabelPd = 20,
    topPd = 15,
    w = $("#all-barchart").width();
	margin = { top: 0, right: 100, bottom: 70, left: 250 },
    svgW = w - margin.left - margin.right - yLabelPd * 2,
    svgH = 560 - margin.top - margin.bottom - topPd;

console.log("width", w);
var svg2 = d3.select("#all-barchart")
    .append("svg")
    .attr("id", "barchart-svg")
    .attr("width", w)
    .attr("height", 560);


// X axis label
// svg2.append("text")
//     .attr("transform", "translate(" + (svgW / 2 + margin.left) + " ," + 560 + ")")
//     .style("text-anchor", "middle")
//     .style("font-size", 20)
//     .style("fill", "#FFF")
//     .text("scenarios");

// Dropdown buttons
$(".dropdown-menu li a").click(function() {
    $(this).parents(".btn-group").find('.btn').html($(this).text() + ' <span class="caret"></span>');
    var one = $(this).parents(".btn-group").find('.btn').text();
    $(this).parents(".btn-group").find('.btn').text();
    $(this).parents(".btn-group").find('.btn').val($(this).data('value'));
})

function setScaleX(scenarios) {
    var scaleX = d3.scale.ordinal()
        .range(0, svgW);
    scaleX.domain(scenarios);
    scaleX.rangeRoundBands([0, svgW], .2);
    //console.log(scaleX.rangeBand());
    return scaleX;
}

/*
Drawing X axis
@param {list} scenarios
*/
function drawXaxis(scaleX) {
    var xAxisCall = d3.svg.axis()
        .scale(scaleX)
        .orient("bottom")
        .tickPadding(4)

    var xAxis = svg2.append("g")
        .attr({
            "class": "x axis",
            "id": "x-axis",
            "transform": "translate(" + [margin.left + yLabelPd, svgH + margin.top + topPd] + ")"
        })
        .call(xAxisCall)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("transform", "rotate(65)")
        .style("text-anchor", "start")
        .style("font-size", 16)
        .style("font-weight", "bold")
        .style("fill", "rgba(64, 255, 12, 1)");
}


function createLegend(jsondata) {
    var data = jsondata.values;
    var y1Label = jsondata.titleY1;
    var y2Label = jsondata.titleY2;

    var legend = svg2.selectAll(".legend-pointer")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "legend-pointer")
        .attr("id", function(d) { return d.scenario; })
        .attr("transform", function(d, i) {
            var lh = legendRect + legendSpacing;
            //var offset = height * color.domain().length / 2;
            var horz = legendRect + 10;
            var vert = i * lh + 10;
            return "translate(" + horz + "," + vert + ")";
        })
        .attr("title", "Hide")
        .on("click", function(d, i) {
            // Result: selected scenario name from legend
            var selected = d3.select(this)
            console.log("selected", selected.attr("title"));
            console.log("index", i, d);
            var legendName = d.scenario;
            // If legend element "title" is "Hide" then 
            if (selected.attr("title") == "Hide") {
                selected
                    .attr("title", "Show")
                    .attr("class", "legend-pointer off")
                hideEle.push(legendName);
                data.splice(i, 1, "Hide"); // Hide elemement
                console.log("Hide element", data);
                reDrawChart(data, y1Label, y2Label);
            } else {
                selected
                    .attr("title", "Hide")
                    .attr("class", "legend-pointer")
                var pos = hideEle.indexOf(legendName);
                hideEle.splice(pos, 1);
                console.log("add element", d);
                data.splice(i, 1, d); // Add element
                reDrawChart(data, y1Label, y2Label);
            }
        });

    legend.append("rect")
        .attr('width', legendRect)
        .attr('height', legendRect)
        .style('fill', function(d, i) {
            return refcolors[d.scenario.split(' ')[0]]; });

    legend.append("text")
        .attr('x', legendRect + legendSpacing)
        .attr('y', legendRect - 2)
        .append("tspan")
        .text(function(d, i) { return d.scenario; })
        //.style('font-size', 18)
        //.style("fill", "rgba(64, 255, 12, 1)");

    if (hideEle.length != 0) {
        hideLegendElements();
    }
}


function reDrawChart(data, y1Label, y2Label) {
    var filtered, scenarios, scaleX;
    d3.selectAll("#x-axis").remove();
    removeAll();
    filtered = data.filter(filterHide);
    scenarios = getScenarios(filtered);
    scaleX = setScaleX(scenarios);
    drawXaxis(scaleX);
    Barchart(filtered, scaleX, y1Label);
    Linechart(filtered, scaleX, y2Label);
}

function filterHide(value) {
    return value != "Hide";
}

// Barchart
function Barchart(dataset1, scaleX, y1Label) {
    var min;
    console.log('Y1 label', y1Label);
    if (y1Label == "Price per Oak") {
        min = d3.min(dataset1, function(d) {
            return d.Y1; });
    } else {
        min = 0;
    }

    // Y axis - Left
    var scaleY = d3.scale.linear()
        .domain([min, d3.max(dataset1, function(d) {
            return d.Y1; })])
        .range([svgH, 0]);

    var yAxisCall = d3.svg.axis()
        .scale(scaleY)
        .tickFormat(function(d) {
        	if (y1Label == "Money Spent") {
        		d = d / 1000;
                y1Value = '$' + d3.format(',')(d) + 'K'
            } else {
                y1Value = d3.format(',')(d);
            }
            return y1Value;
        })
        .orient("left")
        .innerTickSize(-svgW)
        .outerTickSize(8)
        .tickPadding(4);

    var yAxis = svg2.append("g")
        .attr({
            "id": "y1g",
            "class": "y1 axis",
            "transform": "translate(" + [margin.left + yLabelPd, margin.top + topPd] + ")"
        })
        .call(yAxisCall);
    // Y axis label
    svg2.append("text")
        .attr({
            "id": "y1label",
            "transform": "translate(" + [w - svgW - 220, svgH / 2] + ") rotate(-90)"
        })
        .style("text-anchor", "middle")
        .style("font-size", 18)
        .style("fill", "rgba(64, 255, 12, 1)")
        .text(y1Label);
    // Y1 tip
    var tipY1 = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return y1Label + ": " + d.Y1;
        })
    svg2.call(tipY1)
        //Bar graph
    var rect = svg2.selectAll('.bar')
        .data(dataset1)
        .enter()
        .append('rect')
        .attr({
            class: "bar",
            x: function(d) {
                return scaleX(d.scenario); },
            y: svgH,
            width: scaleX.rangeBand(),
            height: 0,
            transform: "translate(" + [margin.left + yLabelPd, margin.top + topPd] + ")"
        })
        .style("fill", function(d) {
        	return refcolors[d.scenario.split(' ')[0]]; })
        .on("mouseover", tipY1.show)
        .on("mouseout", tipY1.hide)
        .transition()
        .delay(function(d, i) {
            return i * 40 })
        .duration(1000)
        .attr("y", function(d) {
            return scaleY(Math.max(0, d.Y1)); })
        .attr("height", function(d) {
            return Math.abs(scaleY(d.Y1) - scaleY(0)); });
    $(".bar").insertBefore(".linechart");
}

function removeAll() {
    svg2.selectAll(".bar").remove();
    svg2.selectAll("#y1g").remove();
    svg2.selectAll("#y1label").remove();
    svg2.selectAll(".linechart").remove();
    svg2.selectAll(".circle").remove();
    svg2.selectAll("#y2g").remove();
    svg2.selectAll("#y2label").remove();
    d3.selectAll("#x-axis").remove();
}

function Linechart(dataset1, scaleX, y2Label) {
    var min;
    if (y2Label == "Price per Oak") {
        min = d3.min(dataset1, function(d) {
            return d.Y2; });
    } else {
        min = 0;
    }
    // Y axis - Right
    var scaleY2 = d3.scale.linear()
        //.domain([d3.min(dataset1, function(d){return d.Y2; }), d3.max(dataset1, function(d){ return d.Y2; })])
        .domain([min, d3.max(dataset1, function(d) {
            return d.Y2; })])
        .range([svgH, 0]);

    var y2AxisCall = d3.svg.axis()
        .scale(scaleY2)
        .tickFormat(function(d) {
            if (y2Label == "Money Spent") {
                d = d / 1000;
                y2Value = '$' + d3.format(',')(d) + 'K'
            } else {
                y2Value = d3.format(',')(d);
            }
            return y2Value;
        })
        .orient("right")
        //.ticks(8)
        .innerTickSize(-svgW)
        .outerTickSize(8)
        .tickPadding(4);

    var y2Axis = svg2.append("g")
        .attr({
            "id": "y2g",
            "class": "y2 axis",
            "transform": "translate(" + [svgW + margin.left + yLabelPd, margin.top + topPd] + ")"
        })
        .call(y2AxisCall);

    // Y2 axis label
    svg2.append("text")
        .attr({
            "id": "y2label",
            "transform": "translate(" + [w - 5, svgH / 2] + ") rotate(-90)"
        })
        .style("text-anchor", "middle")
        .style("font-size", 18)
        .style("fill", "rgba(64, 255, 12, 1)")
        .text(y2Label);

    // Y2 tip
    var tipY2 = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return y2Label + ": " + d.Y2;
        })
    svg2.call(tipY2)

    // Line chart
    var valueline = d3.svg.line()
        .x(function(d) {
            return scaleX(d.scenario); })
        .y(function(d) {
            return scaleY2(d.Y2); });

    svg2.append("path")
        .attr({
            "class": "linechart",
            "d": valueline(dataset1[0]),
            "fill": "none",
            "transform": "translate(" + [margin.left + yLabelPd + scaleX.rangeBand() / 2, margin.top + topPd] + ")"
        })
        .transition()
        .delay(function(d, i) {
            return i })
        .duration(1500)
        .attrTween("d", pathTween);

    function pathTween() {
        var interpolate = d3.scale.quantile()
            .domain([0, 1])
            .range(d3.range(1, dataset1.length + 1));
        return function(t) {
            return valueline(dataset1.slice(0, interpolate(t)));
        };
    }

    d3.select(".linechart")
        .attr("d", valueline(dataset1));

    // Circles
    svg2.selectAll(".circle")
        .data(dataset1)
        .enter()
        .append("circle")
        .attr({
            "class": "circle",
            "cx": function(d) {
                return scaleX(d.scenario); },
            "cy": function(d) {
                return scaleY2(d.Y2); },
            "r": 5,
            "transform": "translate(" + [margin.left + yLabelPd + scaleX.rangeBand() / 2, margin.top + topPd] + ")"
        })
        .on("mouseover", tipY2.show)
        .on("mouseout", tipY2.hide);
}

/*
@param {object} jsonObj for barchart (a)
@param {object} jsonObj for linechart (b)
@return {object} a + b
*/
function dataConcat(bardata, linedata) {
    var data = { "titleY1": bardata.title, "titleY2": linedata.title };
    var barvalues = bardata.value;
    var linevalues = linedata.value;
    var valuelist = []
    $(barvalues).each(function(i, v) {
        var dataconcat = {}
        dataconcat.scenario = v.scenario;
        dataconcat.Y1 = v.Y;
        dataconcat.Y2 = linevalues[i].Y;
        valuelist.push(dataconcat);
    })
    data.values = valuelist;
    return data;
}

function getScenarios(values) {
    var scenarios = []
    $(values).each(function(i, v) {
        scenarios.push(v.scenario);
    })
    return scenarios;
}

function hideElements(data) {
    // Get index of element
    var filtered;
    var values = data.values;
    if (hideEle.length != 0) {
        for (var idx in hideEle) {
            var ele = hideEle[idx];
            values.forEach(function(d, i) {
                if (ele == d.scenario) {
                    values.splice(i, 1, "Hide");
                }
            })
        } // for
    }
    filtered = values.filter(filterHide);
    data.values = filtered;
    return data;
}


function hideLegendElements() {
    console.log("here", hideEle);
    //hideIdx.sort(function(a, b){return a-b});
    if (hideEle.length != 0) {
        for (idx in hideEle) {
            var val = hideEle[idx];
            console.log("hide index", val);
            d3.select("#" + val)
                .attr("class", "legend-pointer off")
                .attr("title", "Show");
        }
    }
}


function assignColors(mergedData){
	var count = 0;
	// Get names
	$.each(mergedData.values, function(idx, val){
		var name = val.scenario.split(' ')[0];
		refcolors[name] = null;
	});
	// Assign a color to a name
	$.each(refcolors, function(key){
		refcolors[key] = colorSelection[count]
		count += 1;
	});
	console.log(refcolors);
	return refcolors
}


function drawChart(d, bar, line) {
    var mergedData, scenarios, scaleX, inData;
    mergedData = dataConcat(d[bar], d[line]);
    console.log("mergedData", mergedData);
    assignColors(mergedData);
    createLegend(mergedData);
    inData = hideElements(mergedData);
    console.log("inData", inData);
    scenarios = getScenarios(inData.values);
    removeAll();
    scaleX = setScaleX(scenarios);
    drawXaxis(scaleX);
    Barchart(mergedData.values, scaleX, mergedData.titleY1);
    Linechart(mergedData.values, scaleX, mergedData.titleY2);
}


// $(document).ready(function(){
// 	$("#bar-nodo").click();
// 	$("#line-ms").click();
// 	var barData = "n_dead_oaks";
// 	var lineData = "money_spent";
// 	drawChart(barData, lineData);
// 	$(".dropdown-menu").on("click", "li", function(e){
// 		 console.log("You clicked the drop downs", e.target)
// 		 var clicked = e.target.id;
// 		var sel, field;
// 		if(typeof clicked != "undefined"){
// 			sel = clicked.split("-")[0]; // bar or line
// 			field = clicked.split("-")[1]; // dara column
// 			if (sel == "bar"){
// 				barData = dataIdList[field];
// 			}else if (sel == "line"){
// 				lineData = dataIdList[field];
// 			}
// 			//console.log("bardata", barData, "lineData", lineData);
// 			svg2.selectAll("g.legend-pointer").remove();
// 		} 
// 		drawChart(barData, lineData);
//      })
// });
