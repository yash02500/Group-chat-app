const express = require('express');
const routes = express.Router();
const userAuthentication =require('../middleware/auth');
const groupControll = require('../controllers/groupController');

routes.post('/create', userAuthentication.authenticate, groupControll.createGroup);
routes.get('/getGroups', userAuthentication.authenticate, groupControll.getGroups);
  
module.exports = routes;
