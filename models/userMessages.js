
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
    allowNull: true
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  fileUrl: {
    type: Sequelize.STRING,
    allowNull: true
  },
  fileName: {
    type: Sequelize.STRING,
    allowNull: true
  }
});
 
module.exports = UserMessages;
