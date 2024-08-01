const sequelize = require('../util/database');
const Sequelize = require('sequelize');
const User= require('./user');

const Groups= sequelize.define('Group',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    admin:{
        type: Sequelize.INTEGER, 
        allownull: false,
    }

});

Groups.belongsTo(User);
module.exports = Groups;