
const UserMessages = require("../models/userMessages");
const User = require("../models/user"); // Import the User model

// Saving user messages
const saveMessage = async (req, res) => {
  const { message, userId, groupId } = req.body;

  try {
    const newMessage = await UserMessages.create({
      message: message,
      userId: userId,
      groupId: groupId
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to save message" });
  }
};

// Getting user messages
const getUserMessages = async (req, res) => {
  try {
    const messages = await UserMessages.findAll({
      where: {
        groupId: req.params.groupId // Assuming you pass groupId as query parameter
      },
      include: [User]
    });

    console.log(messages);

    res.status(200).json({ messages: messages });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
};

module.exports = {
  saveMessage,
  getUserMessages
};

