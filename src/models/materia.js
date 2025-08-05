const { DataTypes, DATE } = require('sequelize');
const sequelize = require('../config/database');

const Materia = sequelize.define('Materia',{
    id: {
        type : DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    carrera: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'materias'
})

module.exports = Materia;