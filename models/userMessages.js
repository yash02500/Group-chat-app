
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const UserMessages = sequelize.define('UserMessages', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  message: {
    type: Sequelize.STRING,
    allowNull: false
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: false
  }
});

module.exports = UserMessages;
