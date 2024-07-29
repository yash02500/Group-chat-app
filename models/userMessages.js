const sequelize = require('../util/database');
const Sequelize = require('sequelize');
const User= require('./user');

const Messages= sequelize.define('Messages',{
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    userId:{
        type: Sequelize.INTEGER,
        allownull: false
    },
    message:{
        type: Sequelize.STRING,
        allownull: false,
    }

});

Messages.belongsTo(User);
module.exports = Messages;