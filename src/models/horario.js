const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Horario = sequelize.define('Horario', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    materiaId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    aulaId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dia: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    horaInicio: {
        type: DataTypes.TIME,
        allowNull: false
    },
    horaFin: {
        type: DataTypes.TIME,
        allowNull: false
    }
},{
    tableName: 'horario'
})

module.exports = Horario