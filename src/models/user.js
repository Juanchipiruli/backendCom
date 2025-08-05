const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User',{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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