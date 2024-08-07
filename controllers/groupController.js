
const Group = require("../models/groups");
const GroupMember = require("../models/groupMember");
const User = require("../models/user");

const createGroup = async (req, res, next) => {
  const { name, adminId, members } = req.body;
  console.log("Request received", req.body);
  if (!name || !adminId) {
    console.log('Values missing');
    return res.sendStatus(400);
  }

  try {
    const newGroup = await Group.create({
      name: name,
      adminId: adminId,
    });

    //Adding admin as member
    await GroupMember.create({
      userId: adminId,
      groupId: newGroup.id,
    })

    if (members && members.length > 0) {
      // Fetch user IDs corresponding to the mobile numbers
      const users = await User.findAll({
        where: {
          mobile: members
        },
        attributes: ['id']
      });

      //Adding users as members
      const memberRecords = users.map(user => ({
        userId: user.id,
        groupId: newGroup.id
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
      include: [{
        model: User,
        as: 'admin',
        attributes: ['id', 'name']
      }, {
        model: User,
        through: { attributes: [] },
        attributes: ['id', 'name'],
        where: {id: userId}
      }]
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

module.exports = {
  createGroup,
  getGroups,
};



