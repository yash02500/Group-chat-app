const express = require('express');
const routes = express.Router();
const userAuthentication =require('../middleware/auth');
const userMsgControll = require('../controllers/userMsgController');

routes.post('/userMessage', userAuthentication.authenticate, userMsgControll.saveMessage);
routes.get('/getUserMessages', userAuthentication.authenticate, userMsgControll.getUserMessages);
  
module.exports = routes;
