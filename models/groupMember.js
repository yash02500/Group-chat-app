const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const User = require("./user");
const Group = require("./groups");

const GroupMember = sequelize.define("GroupMember", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    }
  },
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: Group,
      key: "id",
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
    }
  }
});

module.exports = GroupMember;
