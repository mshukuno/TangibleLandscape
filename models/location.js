module.exports = function(sequilize, DataTypes){
	return sequilize.define('location', {
		name:{
			type: DataTypes.STRING,
			allowNull: false
		},
		county:{
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 25]
			}
		},
		state:{
			type: DataTypes.STRING,
			allowNull: false,
			validate: {
				len: [1, 25]
			}
		},
		north_lat:{
			type: DataTypes.DOUBLE,
			allowNull: true
		},
		south_lat:{
			type: DataTypes.DOUBLE,
			allowNull: true
		},
		east_long:{
			type: DataTypes.DOUBLE,
			allowNull: true
		},
		west_long:{
			type: DataTypes.DOUBLE,
			allowNull: true
		},
		description:{
			type: DataTypes.STRING,	
			allowNull: false,
		}
	});
}