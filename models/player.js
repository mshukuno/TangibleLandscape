module.exports = function(sequilize, DataTypes){
	return sequilize.define('player', {
		name:{
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				len: [1, 25]
			}
		}
	});
}