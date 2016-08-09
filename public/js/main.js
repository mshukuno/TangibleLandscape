var tangeo = {
    'locationId': null,
    'baseline': null,
    'dataKeys': {
        'n_dead_oaks': 'Number of Dead Oaks',
        'percent_dead_oaks': 'Percentage of Dead Oaks',
        'infected_area_ha': 'Infected Area (ha)',
        'money_spent': 'Money Spent',
        'area_treated_ha': 'Area Treated (ha)',
        'price_per_oak': 'Price per Oak'
    } 
}

var baseline = [
  {
    'try': '',
    'n_dead_oaks': 56784,
    'percent_dead_oaks': 5.898,
    'infected_area_ha': 3417,
    'money_spent': 0,
    'area_treated_ha': 0,
    'price_per_oak': 0,
    'player': {
        'name': 'Baseline'
    }
  }
]

//////////////////////////////////
///////    Data Query      ///////
//////////////////////////////////
var apiUrl = 'http://localhost:3000';

function playerPost(send) {
    $.ajax({
        type: 'POST',
        url: apiUrl + '/players',
        data: send,
        contentType: 'application/json',
        dataType: 'json',
        success: function(data) {
            console.log(data);
            $('#playerModal').modal('hide');
            getPlayerId();
        },
        error: function(err) {
            console.log(err)
                //alert('Enter other palyer name.');
        }
    });
}

function getPlayerId() {
    $.ajax({
        url: apiUrl + '/last',
        type: 'GET',
        success: function(data) {
            $('#palyer-who').append('<h3>ID:   ' + data.id + ' Player: ' + data.name + '</h3>');
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function getResultsById(pid) {
    $.ajax({
        url: apiUrl + '/results/player/' + pid,
        type: 'GET',
        success: function(data) {
            data.splice(0, 0, tangeo.baseline[0]);
            console.log(data);
            var tableData = JSON.parse(JSON.stringify(data));
            circularRadarChart(data);
            tableVerticalHeader(tableData);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function getAllPlayers() {
    $.ajax({
        url: apiUrl + '/players',
        type: 'GET',
        success: function(data) {
            //console.log(data.name);
            $.each(data, function(index, value) {
                $('#search-player').append('<li><a>' + value.id + ': ' + value.name + '</a></li>');
            });
        },
        error: function(err) {
            console.log(error)
        }
    });
}

function getBaselineByLocId(locId) {
    $.ajax({
        url: apiUrl + '/baselines/' + locId,
        type: 'GET',
        success: function(data) {
            tangeo.baseline = data;
            console.log(tangeo.baseline);
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function getAllLocations(eleId) {
    $.ajax({
        url: apiUrl + '/locations',
        type: 'GET',
        success: function(data) {
            $.each(data, function(index, value) {
                console.log(index, value.name);
                $(eleId).append('<li><a>' + value.id + ': ' + value.name + ', ' + value.state + '</a></li>');
            });
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function getResultsByLocationId(locid) {
    return $.parseJSON($.ajax({
        url: apiUrl + '/results/location/' + locid,
        type: 'GET',
        async: false,
        success: function () {
            console.log('Success');
        },
        error: function () {
            console.log('Error');
        }
    }).responseText);
}


function barLineChartFormatData(results, dataKeys){
    console.log(results)
    var keys = d3.keys(results[0]);

    //results.splice(0, 0, tangeo.baseline[0]);
    results.splice(0, 0, baseline[0]);
    console.log('after baseline insert', results)
    console.log('data keys', dataKeys);
    var data = {}
    // Create a new data format
    $.each(dataKeys, function(key, value) {
        console.log('154', key, value);
        data[key] = {
            'title': dataKeys[key],
            'value': []
        }
    })

    // Insert results data in to a new data
    $.each(results, function(idx, val) {
        for (var i in keys) {
            var key = keys[i];
            if (key in data === true) {
                data[key].value.push({
                    'Y': val[key],
                    'scenario': val.player.name + ' ' + val.try
                });
            }
        }
    });
    return data;
}


/////////////////////////////////////////////////////////
/////////////////////////Table //////////////////////////
/////////////////////////////////////////////////////////
function tableVerticalHeader(tdata) {
    d3.select('#player-table').select('table').remove();
    var headerNames = d3.keys(tdata[0]);
    var item = ''
    headerNames.splice(0, 0, '#');
    
    
    for (var i = 0; i < tdata.length; ++i) {
        if (i == 0) {
            tdata[i]['#'] = 'Baseline';
        } else if (i == 1) {
            tdata[i]['#'] = 'First';
        } else if (i == 2) {
            tdata[i]['#'] = 'Second';
        } else if (i == 3) {
            tdata[i]['#'] = 'Third';
        }
    }

    var table = d3.select('#player-table')
        .append('table')
        .attr('class', 'table table-condensed table-bordered')
        .attr('id', 'player-table')
        .style('width', '80%')
        .style('margin', 'auto');

    var thead = table.append('thead');
    var tbody = table.append('tbody');

    // append the header row
    thead.append('tr')
        .selectAll('th')
        .data(headerNames)
        .enter()
        .append('th')
        .style('text-align', 'center')
        .style('font-size', 30)
        .style('color', 'white')
        .text(function(headerNames) {
            return headerNames;
        });

    // create a row for each object in the data
    var rows = tbody.selectAll('tr')
        .data(tdata)
        .enter()
        .append('tr');

    // create a cell in each row for each column
    var cells = rows.selectAll('td')
        .data(function(row) {
            return headerNames.map(function(headerName) {
                return row[headerName];
            });
        })
        .enter()
        .append('td')
        .style('font-size', 36)
        .style('color', 'white')
        .text(function(d) {
            return d;
        });
}

//*********************************
//  Document.ready()
//*********************************
$(document).ready(function() {
    
    var test = $('#play').height() * 0.75;
    console.log('play page height: ', test);
    $('#play-canvas').height(test);
    $('#table-canvas').height(test);
    // Handler for .ready() called.
    $('#location-submit').on('click', function(e) {
        e.preventDefault();
        $('#selectLocModal').modal('hide');
    })

    $('#player-submit').on('click', function(e) {
            e.preventDefault(); // To prevent following the link (optional)
            var player = $('input').val();
            var send = JSON.stringify({
                'name': player
            });
            playerPost(send);
        }) // player-submit
        // Get all locations for 'Select location'
    getAllLocations('#search-location');

    getAllLocations('#dataSelectLoc');
    // Get all players for 'SEARCH PLAYER'
    getAllPlayers();


    $('#bar-nodo').click();
    $('#line-ms').click();
    var barData = 'n_dead_oaks';
    var lineData = 'money_spent';
    var result = getResultsByLocationId(1);
    var jsonResult = barLineChartFormatData(result, tangeo.dataKeys);
    console.log(jsonResult);
    
    drawChart(jsonResult, barData, lineData);
    $('.dropdown-menu').on('click', 'li', function(e) {
        //console.log('You clicked the drop downs', e.target)
        var parent = $(this).parent()[0].id;
        console.log(parent)
        if (parent === 'bar-dropdown' || parent === 'line-dropdown') {
            var clicked = e.target.id;
            var sel, field;
            if (typeof clicked != 'undefined') {
                sel = clicked.split('-')[0]; // bar or line
                field = clicked.split('-')[1]; // dara column
                if (sel == 'bar') {
                    barData = dataIdList[field];
                } else if (sel == 'line') {
                    lineData = dataIdList[field];
                }
                //console.log('bardata', barData, 'lineData', lineData);
                //svg2.selectAll('g.legend-pointer').remove();
            }
            drawChart(jsonResult, barData, lineData);

        } else if (parent === 'search-player') {
            $('#' + srcfg.svgId).html('');
            var playerId = $(this).text().split(':')[0];
            console.log('player id', playerId);
            if (tangeo.baseline != null){
                getResultsById(playerId);
            } else {
                alert('Select location');
            }
            
        } else if (parent === 'search-location') {
            var location = $(this).text();
            var locationId = $(this).text().split(':')[0];
            console.log('location id', locationId);
            tangeo.locationId = locationId;
            getBaselineByLocId(locationId);
            $('#location-name').empty();
            $('#location-name').append(location);
        } 
    });
});
