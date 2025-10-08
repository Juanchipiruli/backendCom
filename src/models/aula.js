const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Aula = sequelize.define('Aula', {
    id: {
        type:DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    sensorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    puertaAbierta: {
        type:DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    cerraduraAbierta: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    ultimaMateriaId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
    }
},{
    tableName: 'aulas'
})

module.exports = Aula