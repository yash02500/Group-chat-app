const Groups = require("../models/groups");

//Saving User messages
const createGroup = async (req, res, next) => {
  const { name, admin } = req.body;
  console.log("Request received", req.body);
  if(!name || !admin){
      console.log('Values missing');
      return res.sendStatus(400);
  }

  try {
    const newGroup = await Groups.create({
      name: name,
      admin: admin,
    });

    console.log("New group created by");
    res.status(201).json(newGroup);
  } catch (error) {
    console.log(error, JSON.stringify(error));
    res.status(500).json({ error });
  }
};

const getGroups = async (req, res, next) => {
  try {
    const groups = await Groups.findAll();
    if (!groups) {
      console.log("groups not found");
      return res.status(404).send("groups not found");
    }

    res
      .status(200)
      .json({ groups: groups, admin: groups.admin, name: groups.name });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error });
  }
};

module.exports = {
  createGroup,
  getGroups
};
