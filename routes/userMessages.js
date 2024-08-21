const express = require('express');
const routes = express.Router();
const userAuthentication =require('../middleware/auth');
const userMsgControll = require('../controllers/userMsgController');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

routes.post('/userMessage', userAuthentication.authenticate, userMsgControll.saveMessage);
routes.post('/upload', userAuthentication.authenticate, upload.single('file'), userMsgControll.uploadMedia);
routes.get('/getUserMessages/:groupId', userAuthentication.authenticate, userMsgControll.getUserMessages);
  
module.exports = routes;
