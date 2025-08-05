const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aula = sequelize.define('Aula', {
    id: {
        type:DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    materiaId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sensorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
},{
    tableName: 'aulas'
})

module.exports = Aula