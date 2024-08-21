const express = require('express');
const routes = express.Router();
const userAuthentication =require('../middleware/auth');
const groupControll = require('../controllers/groupController');

routes.post('/create', userAuthentication.authenticate, groupControll.createGroup);
routes.post('/addMember', userAuthentication.authenticate, groupControll.addNewMember);
routes.post('/makeAdmin/:groupId/:userToMakeAdmin', userAuthentication.authenticate, groupControll.makeAdmin);
routes.get('/getGroups', userAuthentication.authenticate, groupControll.getGroups);
routes.get('/getGroups/:groupId', userAuthentication.authenticate, groupControll.getMembers);
routes.delete('/removeUser/:groupId/:userToRemove', userAuthentication.authenticate, groupControll.deleteMember);

module.exports = routes;
