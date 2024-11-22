const UserMessages = require("../models/userMessages");
const User = require("../models/user"); // Import the User model
const Group = require("../models/groups");
const AWS = require("aws-sdk");
const uuid = require('uuid');
const dotenv = require("dotenv");
dotenv.config();

// Saving user messages
const saveMessage = async (req, res) => {
  const { message, userId, groupId } = req.body;

  try {
    const newMessage = await UserMessages.create({
      message: message,
      userId: userId,
      groupId: groupId,
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
        groupId: req.params.groupId, 
      },
      include: [
        {
          model: User,
          attributes: { exclude: ["password"] }, // Exclude the password column from the User model
        },
      ] 
    });

    const groupId = req.params.groupId;
    //Admin of fetched group
    const groupAdmin = await Group.findOne({
      where: { id: groupId },
    });

    res.status(200).json({ messages: messages, admin: groupAdmin });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
};

const uploadMedia = async (req, res, next) => {
  const file = req.file;
  const groupId = req.body.currentGroupId;

  if (!req.file) {
    return res.status(400).json({ error: "Nooooo file uploaded" });
  }
  
  const fileName = `${uuid.v4()}-${file.originalname}`;
  const originalFileName = file.originalname; // Store the original file name

  console.log(req);

  const BUCKET_NAME = process.env.BUCKET_NAME;
  const IAM_USER_KEY = process.env.IAM_USER_KEY;
  const IAM_USER_SECRET = process.env.IAM_USER_SECRET;

  // Set up AWS S3 credentials
  const s3 = new AWS.S3({
    accessKeyId: IAM_USER_KEY,
    secretAccessKey: IAM_USER_SECRET,
  });

  // Upload file to S3
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  try {
    const data = await s3.upload(params).promise();
 
    await UserMessages.create({
      userId: req.user.id, 
      groupId: groupId,
      fileUrl: data.Location,
      fileName: originalFileName
    });

    res.status(200).json({ fileUrl: data.Location, fileName: originalFileName });
  } catch (error) {
    console.error("Error uploading file", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
};

module.exports = {
  saveMessage,
  getUserMessages,
  uploadMedia,
};
