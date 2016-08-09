   
//*********************************
// Page: Play
// Code: Circular Radar Chart
//*********************************

/////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////// ////// Modified by Makiko Shukunobe /////////////
/////////////////////////////////////////////////////////

var srcfg = {
    svgWidth: $('#player-radar').width(),
    svgHeight: $('#player-radar').width(),
    margin: { top: 50, right: 50, bottom: 0, left: 50 },
    svgId: 'svg-sr',
    color: d3.scale.category20(),
    scenarios: ['Baseline', 'First', 'Second', 'Third'],
    dataScaled: [],
    legRect: 20,
    legSpacing: 15,
    circumference: 500,
    maxValue: 10,
    levels: 10,
    opacityCircles: 0.1,
    wrapWidth: 60,
    labelFactor: 1.25,
    roundStrokes: true,
    opacityArea: 0.35,
    rescaleFlip: ['n_dead_oaks', 'percent_dead_oaks', 'infected_area_ha'],
    minValue: 0,
    dotRadius: 4,
    strokeWidth: 2,
}


// console.log('getWidth: ', getWidth, 'getHeight: ', getHeight);
d3.select(srcfg.svgId).select('svg').remove();
var svgSize = srcfg.svgWidth + srcfg.margin.left + srcfg.margin.right
var svg = d3.select('#player-radar')
    .append('svg')
    .attr('id', srcfg.svgId)
    .attr('width', srcfg.svgWidth + srcfg.margin.left + srcfg.margin.right)
    .attr('height', srcfg.svgHeight - srcfg.margin.top + srcfg.margin.bottom);



//////////////////////////////////
/////// Data Preparation /////////
//////////////////////////////////
function reformatData(data) {
    $.each(data, function(i, v) {
        var array = [{ 'name': srcfg.scenarios[i] }];
        //srcfg.scenarios.push(v.scenario);
        srcfg.dataScaled.push(array);
    })
    return srcfg.dataScaled;
}

function rescale(values, newMin, newMax) {
    var vMin = d3.min(values),
        vMax = d3.max(values),
        newScale = [],
        newVer = 0;

    $.each(values, function(d, v) {
        newVer = (v - vMin) * (newMax - newMin) / (vMax - vMin) + newMin;
        newScale.push(parseInt(Math.round(newVer)));
    });
    console.log('newScale', newScale);
    return newScale;
}

function rescaleAll(allaxis, data, newdata) {
    $.each(allaxis, function(i, axis) {

        var rescaledValues = [],
            temp = null,
            values = $.map(data, function(v, j) {
                srcfg.dataScaled[j].push({ 'axis': axis, 'value': 0 });
                return Number(v[axis]);
            });
        //console.log('values', values);
        if (srcfg.rescaleFlip.indexOf(axis) != -1) {
            temp = rescale(values, srcfg.minValue, srcfg.levels);
            $.each(temp, function(k, z) {
                rescaledValues.push(srcfg.levels - z)
            });
        } else {
            rescaledValues = rescale(values, srcfg.minValue, srcfg.levels);
        }

        $.each(newdata, function(idx, val) {
            $.each(val, function(num, content) {

                if (content.axis == axis) {
                    //console.log(rescaledValues[idx]);
                    content.value = rescaledValues[idx];
                    //console.log(content.value);
                }
            });
        });
    })
}

function circularRadarChart(data) {
    var test = reformatData(data);
    console.log(test);

    ////////// Create Legend //////////
    srcfg.color.domain(srcfg.scenarios)
    var leg = svg.append('g')
        .attr('transform', 'translate(' + srcfg.margin.left + ',' + srcfg.margin.top + ')');

    var srleg = leg.selectAll('.scaled-legend')
        .data(srcfg.color.domain())
        .enter()
        .append('g')
        .attr('class', 'scaled-legend')
        .attr('transform', function(d, i) {
            var legH = srcfg.legRect + srcfg.legSpacing,
                horz = srcfg.legRect + 10,
                vert = i * legH + 10;
            return 'translate(' + horz + ',' + vert + ')';
        });

    srleg.append('rect')
        .attr('width', srcfg.legRect)
        .attr('height', srcfg.legRect)
        .style('fill', srcfg.color);

    srleg.append('text')
        .attr('x', srcfg.legRect + srcfg.legSpacing)
        .attr('y', srcfg.legRect - 2)
        .attr('title', 'Hide')
        .style('font-weight', 'bold')
        .style('font-size', 20)
        .style('fill', 'white')
        .text(function(d) {
            return d;
        })
        .on('click', function(d, i) {
            var legtext = d3.select(this);
            console.log(legtext.attr('title'));

            if (legtext.attr('title') == 'Show') {
                d3.select('#srpoly-' + d)
                    .style('display', 'block');
                d3.select('#srcircle-' + d)
                    .style('display', 'block');
                legtext.attr('title', 'Hide')
                    .style('font-weight', 'bold');
            } else {
                d3.select('#srpoly-' + d)
                    .style('display', 'none');
                d3.select('#srcircle-' + d)
                    .style('display', 'none');
                legtext.attr('title', 'Show')
                    .style('font-weight', 'normal');
            }
        })

    /////////////////////////////////
    ////////// Radar Chart //////////
    /////////////////////////////////

    ////////// Axis //////////
    var allAxis = Object.keys(data[0]),
        radius = srcfg.circumference / 2,
        total = allAxis.length, // -1 for scenario
        angleSlice = Math.PI * 2 / total, //Angle of axis
        Format = d3.format('g');
    //allAxis.splice(0, 1);
    console.log('allAxis', allAxis);
    rescaleAll(allAxis, data, srcfg.dataScaled);
    //Scale for the radius
    var rScale = d3.scale.linear()
        .range([0, radius])
        .domain([0, srcfg.maxValue]);

    var srg = svg.append('g')
        .attr('id', 'scaled-radar-g')
        .attr('transform', 'translate(' + (radius + srcfg.margin.left + 200) + ',' + (radius + srcfg.margin.top + 50) + ')');


    /////////////////////////////////////////////////////////
    ////////// Glow filter for some extra pizzazz ///////////
    /////////////////////////////////////////////////////////

    //Filter for the outside glow
    var filter = srg.append('defs').append('filter').attr('id', 'glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    /////////////////////////////////////////////////////////
    /////////////// Draw the Circular grid //////////////////
    /////////////////////////////////////////////////////////

    //Wrapper for the grid & axes
    var axisGrid = srg.append('g')
        .attr('class', 'axisWrapper');

    //Draw the background circles
    axisGrid.selectAll('.levels')
        .data(d3.range(1, (srcfg.levels + 1)).reverse())
        .enter()
        .append('circle')
        .attr('class', 'gridCircle')
        .attr('r', function(d, i) {
            return radius / srcfg.levels * d;
        })
        .style('fill', '#CDCDCD')
        .style('stroke', '#CDCDCD')
        .style('fill-opacity', srcfg.opacityCircles)
        .style('filter', 'url(#glow)');

    //Text indicating at what % each level is
    axisGrid.selectAll('.axisLabel')
        .data(d3.range(1, (srcfg.levels + 1)).reverse())
        .enter().append('text')
        .attr('class', 'axisLabel')
        .attr('x', 4)
        .attr('y', function(d) {
            return -d * radius / srcfg.levels;
        })
        .attr('dy', '0.4em')
        .style('font-size', '12px')
        .attr('fill', '#737373')
        .text(function(d, i) {
            return Format(srcfg.maxValue * d / srcfg.levels);
        });


    /////////////////////////////////////////////////////////
    //////////////////// Draw the axes //////////////////////
    /////////////////////////////////////////////////////////

    //Create the straight lines radiating outward from the center
    var axis = axisGrid.selectAll('.axis')
        .data(allAxis)
        .enter()
        .append('g')
        .attr('class', 'axis');
    //Append the lines
    axis.append('line')
        .attr('x1', 0)
        .attr('y1', 0)
        .attr('x2', function(d, i) {
            return rScale(srcfg.maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr('y2', function(d, i) {
            return rScale(srcfg.maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .attr('class', 'line')
        .style('stroke', 'white')
        .style('stroke-width', '2px');

    //Append the labels at each axis
    axis.append('text')
        .attr('class', 'legend')
        .style('font-size', '12px')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.1em') //0.35em
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .attr('x', function(d, i) {
            return rScale(srcfg.maxValue * srcfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr('y', function(d, i) {
            return rScale(srcfg.maxValue * srcfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .text(function(d) {
            return d
        })
        .call(wrap, srcfg.wrapWidth);

    /////////////////////////////////////////////////////////
    ///////////// Draw the radar chart blobs ////////////////
    /////////////////////////////////////////////////////////
    var legendOptions = [];

    function removeSeries(d) {
        var values = $.map(d, function(i, v) {
            if (i.name) {
                legendOptions.push(i.name);
            } else {
                return i;
            }
        });
        return values;
    }
    //The radial line function
    var radarLine = d3.svg.line.radial()
        .interpolate('linear-closed')
        .radius(function(d) {
            return rScale(d.value);
        })
        .angle(function(d, i) {
            return i * angleSlice;
        });

    if (srcfg.roundStrokes) {
        radarLine.interpolate('cardinal-closed');
    }


    //Create a wrapper for the blobs
    var blobWrapper = srg.selectAll('.radarWrapper')
        .data(srcfg.dataScaled)
        .enter().append('g')
        .attr('class', 'radarWrapper')
        .attr('id', function(d) {
            return 'srpoly-' + d[0].name;
        })
        .style('display', 'block');

    //Append the backgrounds    
    blobWrapper
        .append('path')
        .attr('class', 'radarArea')
        .attr('d', function(d, i) {
            return radarLine(removeSeries(d));
        })
        .style('fill', function(d, i) {
            return srcfg.color(d[0].name);
        })
        .style('fill-opacity', srcfg.opacityArea)
        .on('mouseover', function(d, i) {
            var selected = d3.select(this)
            console.log(selected);
            console.log(d, i);

            //Dim all blobs
            d3.selectAll('.radarArea')
                .transition().duration(200)
                .style('fill-opacity', 0.1);
            //Bring back the hovered over blob
            d3.select(this)
                .transition().duration(200)
                .style('fill-opacity', 0.7);
        })
        .on('mouseout', function() {
            //Bring back all blobs
            d3.selectAll('.radarArea')
                .transition().duration(200)
                .style('fill-opacity', srcfg.opacityArea);
        });

    //Create the outlines   
    blobWrapper.append('path')
        .attr('class', 'radarStroke')
        .attr('d', function(d, i) {
            return radarLine(removeSeries(d));
        })
        .style('stroke-width', srcfg.strokeWidth + 'px')
        .style('stroke', function(d, i) {
            return srcfg.color(d[0].name);
        })
        .style('fill', 'none')
        .style('filter', 'url(#glow)');

    //Append the circles
    blobWrapper.selectAll('.radarCircle')
        .data(function(d, i) {
            return removeSeries(d);
        })
        .enter().append('circle')
        .attr('class', 'radarCircle')
        .attr('r', srcfg.dotRadius)
        .attr('cx', function(d, i) {
            return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr('cy', function(d, i) {
            return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .style('fill', function(d, i, j) {
            return srcfg.color(j);
        })
        .style('fill-opacity', 0.8);


    /////////////////////////////////////////////////////////
    //////// Append invisible circles for tooltip ///////////
    /////////////////////////////////////////////////////////

    //Wrapper for the invisible circles on top
    var blobCircleWrapper = srg.selectAll('.radarCircleWrapper')
        .data(srcfg.dataScaled)
        .enter().append('g')
        .attr('class', 'radarCircleWrapper')
        .attr('id', function(d) {
            return 'srcircle-' + d[0].name;
        })
        .style('display', 'none');

    //Append a set of invisible circles on top for the mouseover pop-up
    blobCircleWrapper.selectAll('.radarInvisibleCircle')
        .data(function(d, i) {
            return removeSeries(d);
        })
        .enter().append('circle')
        .attr('class', 'radarInvisibleCircle')
        .attr('r', srcfg.dotRadius * 1.5)
        .attr('cx', function(d, i) {
            return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
        })
        .attr('cy', function(d, i) {
            return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
        })
        .style('fill', 'none')
        .style('pointer-events', 'all')
        .on('mouseover', function(d, i) {
            newX = parseFloat(d3.select(this).attr('cx')) - 10;
            newY = parseFloat(d3.select(this).attr('cy')) - 10;

            tooltip
                .attr('x', newX)
                .attr('y', newY)
                .text(Format(d.value))
                .transition().duration(200)
                .style('opacity', 1);
        })
        .on('mouseout', function() {
            tooltip.transition().duration(200)
                .style('opacity', 0);
        });

    //Set up the small tooltip for when you hover over a circle
    var tooltip = srg.append('text')
        .attr('class', 'tooltip')
        .style('opacity', 0);

    /////////////////////////////////////////////////////////
    /////////////////// Helper Function /////////////////////
    /////////////////////////////////////////////////////////

    //Taken from http://bl.ocks.org/mbostock/7555321
    //Wraps SVG text    
    function wrap(text, width) {
        text.each(function() {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.4, // ems
                y = text.attr('y'),
                x = text.attr('x'),
                dy = parseFloat(text.attr('dy')),
                tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(' '));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(' '));
                    line = [word];
                    tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
                }
            }
        });
    } //wrap    
}