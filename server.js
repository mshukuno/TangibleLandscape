var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var http = require('http').Server(app);
var oaks = [];
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());


app.get('/', function(req, res) {
    res.send('OAk API Root');
});

// POST /players - save a user name 
app.post('/players', function(req, res) {
    var body = _.pick(req.body, 'name');
    db.player.create(body).then(function(player) {
        res.send(body);
    }, function(e) {
        res.status(500).send();
    });
});

// GET /player/:id
app.get('/players/:id', function(req, res) {
    var playerId = parseInt(req.params.id, 10);

    db.player.findOne({
        where: {
            id: playerId
        }
    }).then(function(player) {
        if (!!player) {
            res.json(player.toJSON());
        } else {
            res.status(404).send();
        }
    }, function(e) {
        res.status(500).send();
    });
});

// POST /results
app.post('/results', function(req, res){
    var body = _.pick(req.body, 'try', 'n_dead_oaks', 'percent_dead_oaks', 
        'infected_area_ha', 'money_spent', 'area_treated_ha', 'price_per_oak',
        'playerId', 'locationId');
    db.game.create(body).then(function(game){
        res.send(body);
    },function(e){
        res.status(500).send();
    });
})


// GET /results/:id
app.get('/results/player/:id', function(req, res){
    var pid = parseInt(req.params.id, 10);

    db.game.findAll({
        attributes: [['n_dead_oaks', 'Number of Dead Oaks'], 
        ['percent_dead_oaks', 'Percentage of Dead Oaks'], 
        ['infected_area_ha', 'Infected Area (ha)'],
        ['money_spent', 'Money Spent'],
        ['area_treated_ha', 'Area Treated (ha)'],
        ['price_per_oak', 'Price per Oak']],
        where: {
            playerId: pid
        },
        order: 'try ASC'
    }).then(function(results){
        if (!!results){
            res.json(results);
        } else {
            res.status(404).send();
        }
    }, function(e){
        res.status(500).send();
    });
})


// GET /results/:id
app.get('/results/location/:id', function(req, res){
    var locId = parseInt(req.params.id, 10);

    db.game.findAll({
        attributes: ['try', 'n_dead_oaks', 'percent_dead_oaks', 
        'infected_area_ha', 'money_spent', 'area_treated_ha', 'price_per_oak'],
        where: {
            locationId: locId
        },
        include: [{model: db.player, attributes: ['name']}]
    }).then(function(results){
        if (!!results){
            //console.log('server.js 100', results);
            res.json(results);
        } else {
            res.status(404).send();
        }
    }, function(e){
        res.status(500).send();
    });
})

// GET /last - get a last row ID 
app.get('/last', function(req, res) {
    db.player.max('id').then(function(maxid) {
        if (!!maxid) {
            db.player.findById(maxid).then(function(palyer) {
                res.json(palyer.toJSON());
            });
        } else {
            res.status(404).send();
        }
    }, function(e) {
        res.status(500).send();
    });
});

// GET /players
app.get('/players', function(req, res) {
    db.player.findAll().then(function(player) {
        if(player.length > 0){
            res.json(player);
        }else{
            res.status(404).send();
        }
    }, function(e){
        res.status(500).send();
    });
});

// DELETE /player/:id
app.delete('/players/:id', function(req, res){
    var playerId = parseInt(req.params.id, 10);

    db.player.destroy({
        where: {
            id: playerId
        }
    }).then(function(rowsDeleted){
        if(rowsDeleted === 0){
            req.status(404).json({
                error: 'No game result with id'
            });
        }else{
            res.status(204).send();
        }
    }, function(){
        res.status(500).send();
    });
});

// GET /results
app.get('/results', function(req, res){
    db.game.findAll().then(function(results){
        res.json(results);
    }, function(e){
        res.status(500).send();
    });
});

// POST /locations
app.post('/locations', function(req, res){
    var body = _.pick(req.body, 'name', 'county', 'state', 'north_lat',
        'south_lat', 'east_long', 'west_long', 'description');
    db.location.create(body).then(function(location){
        res.send(body.toJSON());
    }, function(e){
        res.status(400).send();
    });
});

// GET /loctions/:id
app.get('/locations/:id', function(req, res){
    var locationId = parseInt(req.params.id, 10);
    db.location.findById(locationId).then(function(location){
        if(!!location){
            res.json(location);
        }else{
            res.status(404).send();
        }
    }, function(e){
        res.status(500).send();
    });
})

// GET /locations
app.get('/locations', function(req, res){
    db.location.findAll({
        attributes: ['id', 'name', 'state']
    }).then(function(locations){
        if(locations.length > 0){
            res.json(locations);
        }else{
            res.status(404).send();
        }
    }, function(e){
        res.status(400).send();
    });
})

// DELETE /loocations/:id
app.delete('/locations/:id', function(req, res){
    var locationId = parseInt(req.params.id, 10);

    db.location.destroy({
        where: {
            id: locationId
        }
    }).then(function(rowsDeleted){
        if(rowsDeleted === 0){
            req.status(404).json({
                error: 'No location result with id'
            });
        }else{
            res.status(204).send();
        }
    }, function(){
        res.status(500).send();
    });
});



app.post('/baselines', function(req, res){
    var body = _.pick(req.body, 'n_dead_oaks', 'percent_dead_oaks', 
        'infected_area_ha', 'money_spent', 'area_treated_ha', 'price_per_oak',
        'locationId');
    db.baseline.create(body).then(function(baseline){
        res.send(body);
    }, function(e){
        res.status(500).send();
    });
})


app.get('/baselines/:id', function(req, res){
    var locId = parseInt(req.params.id, 10);

    db.baseline.findAll({
        attributes: [['n_dead_oaks', 'Number of Dead Oaks'], 
        ['percent_dead_oaks', 'Percentage of Dead Oaks'], 
        ['infected_area_ha', 'Infected Area (ha)'],
        ['money_spent', 'Money Spent'],
        ['area_treated_ha', 'Area Treated (ha)'],
        ['price_per_oak', 'Price per Oak']],
        where: {
            locationId: locId
        }
    }).then(function(baseline){
        if(!!baseline){
            res.json(baseline);
        }else{
            res.status(404).send();
        }
    }, function(e){
        res.status(500).send();
    });
})


db.sequelize.sync().then(function() {
    //  app.listen(PORT, function(){
    //      console.log('Express listening on port', + PORT + '!');
    //  });
    http.listen(PORT, function() {
        console.log('Server started');
    });
});
