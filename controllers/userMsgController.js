const UserMessage = require("../models/userMessages");

//Saving User messages
const saveMessage = async (req, res, next) => {
  const { userId, name, message } = req.body;
  console.log("Request received", req.body);
  if (!message) {
    console.log("Values missing");
    return res.sendStatus(400);
  }

  try {
    const newMessage = await UserMessage.create({
      UserId: userId,
      name: name,
      message: message,
    });

    console.log("Message saved");
    res.status(201).json(newMessage);
  } catch (error) {
    console.log(error, JSON.stringify(error));
    res.status(500).json({ error });
  }
};

//Getting user messages
const getUserMessages = async (req, res, next) => {
  try {
    const userMessage = await UserMessage.findAll();
    if (!userMessage) {
      console.log("Messages not found");
      return res.status(404).send("Messages not found");
    }

    res
      .status(200)
      .json({
        message: userMessage,
        id: userMessage.UserId,
        name: userMessage.name,
      });
  } catch (error) {
    console.log(error);
    res.status(501).json({ error });
  }
};

module.exports = {
  saveMessage,
  getUserMessages,
};
