const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const User = require("./user");

const Group = sequelize.define("Group", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  adminId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});

// Associations
Group.belongsTo(User, { as: "admin", foreignKey: "adminId" });

module.exports = Group;
