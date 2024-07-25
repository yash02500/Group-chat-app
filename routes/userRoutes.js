const express = require('express');
const routes = express.Router();
const userControll = require('../controllers/userController');

routes.post('/signup', userControll.addUser);
routes.post('/login', userControll.login);

module.exports = routes;