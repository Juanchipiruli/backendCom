const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Catedra = sequelize.define('Catedra',{
    materiaId:{
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    userId :{
        type: DataTypes.INTEGER,
        primaryKey: true
    }
}, {
    tableName: 'catedras',
    timestamps: false
});

module.exports = Catedra