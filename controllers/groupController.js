const Group = require("../models/groups");
const GroupMember = require("../models/groupMember");
const User = require("../models/user");

const createGroup = async (req, res, next) => {
  const { name, adminId, members } = req.body;
  console.log("Request received", req.body);
  if (!name || !adminId) {
    console.log("Values missing");
    return res.sendStatus(400);
  }

  try {
    const newGroup = await Group.create({
      name: name,
      adminId: [adminId],
    });

    //Adding admin as member
    await GroupMember.create({
      userId: adminId,
      groupId: newGroup.id,
      role: "admin",
    });

    if (members && members.length > 0) {
      // Fetch user IDs corresponding to the mobile numbers
      const users = await User.findAll({
        where: {
          mobile: members,
        },
        attributes: ["id"],
      });

      //Adding users as members
      const memberRecords = users.map((user) => ({
        userId: user.id,
        groupId: newGroup.id,
        role: "member",
      }));

      await GroupMember.bulkCreate(memberRecords);
    }

    console.log("New group created by");
    res.status(201).json(newGroup);
  } catch (error) {
    console.log(error, JSON.stringify(error));
    res.status(500).json({ error });
  }
};

const getGroups = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const groups = await Group.findAll({
      include: [
        {
          model: User,
          as: "admin",
          attributes: ["id", "name"],
        },
        {
          model: User,
          through: { attributes: [] },
          attributes: ["id", "name"],
          where: { id: userId },
        },
      ],
    });

    if (!groups) {
      console.log("groups not found");
      return res.status(404).send("groups not found");
    }

    res.status(200).json({ groups });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error });
  }
};

//Getting group members
const getMembers = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;

    const GroupMembers = await GroupMember.findAll({
      where: { groupId: groupId },
      include: [
        {
          model: User,
          attributes: { exclude: ["password"] }, // Exclude the password column from the User model
        },
      ],
    });

    if (!GroupMembers) {
      console.log("groups not found");
      return res.status(404).send("groups not found");
    }
    console.log(GroupMembers);
    res.status(200).json({ GroupMembers });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error });
  }
};

//Deleting member from group
const deleteMember = async (req, res, next) => {
  const userId = req.params.userToRemove;
  const groupId = req.params.groupId;

  try {
    await GroupMember.destroy({ where: { userId: userId, groupId: groupId } });
    return res
      .status(200)
      .json({ message: "Successfully removed", userId, groupId });
  } catch (error) {
    console.log(error);
  }
};

//Adding new group member
const addNewMember = async (req, res, next) => {
  const { groupId, mobile } = req.body;
  console.log("Request received", req.body);
  if (!groupId || !mobile) {
    console.log("Values missing");
    return res.sendStatus(400);
  }

  try {
    const groups = await Group.findOne({
      where: { adminId: req.user.id },
    }); //maybe findOne or all search difference
    if (groups.adminId) {
      const user = await User.findOne({ where: { mobile: mobile } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const newMember = await GroupMember.create({
        userId: user.id,
        groupId: groupId,
      });
      console.log("New member added in group");
      res.status(201).json({ newMember });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add new member" });
  }
};

//Making user admin
const makeAdmin = async (req, res, next) => {
  const groupId = req.params.groupId; // Group where the admin wants to add another admin
  const userToMakeAdmin = req.params.userToMakeAdmin; // User to be made admin

  try {
    // Check if the current user is an admin of the group
    const group = await Group.findOne({
      where: {
        id: adminid,
      },
    });

    if (group.id === groupId) {
      // Add the new admin to the GroupAdmin table
      await Group.create({
        groupId: groupId,
        adminId: userToMakeAdmin,
      });

      console.log("New admin added in group");
      return res.status(201).json({ message: "New admin added" });
    } else {
      return res
        .status(403)
        .json({ error: "You are not authorized to make admin" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to add new admin" });
  }
};

module.exports = {
  createGroup,
  getGroups,
  getMembers,
  deleteMember,
  addNewMember,
  makeAdmin,
};
