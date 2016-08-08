var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/data/tangeo_sod.sqlite'
});

var db = {};


db.player = sequelize.import(__dirname + '/models/player.js');
db.game = sequelize.import(__dirname + '/models/game.js');
db.baseline = sequelize.import(__dirname + '/models/baseline.js');
db.location = sequelize.import(__dirname + '/models/location.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.game.belongsTo(db.player);
db.player.hasMany(db.game);
db.game.belongsTo(db.location);
db.location.hasOne(db.baseline);
module.exports = db;