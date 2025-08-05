const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    materiaId: {
        type: DataTypes.INTEGER,
        allowNull:false
    },
    huellaId:{
        type: DataTypes.INTEGER,
        unique: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    }
},{
    tableName: 'users'
})

module.exports = User;