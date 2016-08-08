module.exports = function(sequelize, DataTypes){
	return sequelize.define('game',{
		try: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: false
		},
		n_dead_oaks: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: false,
		},
		percent_dead_oaks: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: false,
		},
		infected_area_ha: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: false
		},
		money_spent: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: false
		},
		area_treated_ha: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: false
		},
		price_per_oak: {
			type: DataTypes.DOUBLE,
			allowNull: false,
			defaultValue: false
		}
	});
};