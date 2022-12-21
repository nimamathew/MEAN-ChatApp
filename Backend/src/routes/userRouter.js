const express = require('express');
const userController = require('../controller/userController')
const userRoute = express.Router();

// Employee model

userRoute.route('/usernameAvailability/:user').get(userController.checkUsername)
userRoute.route('/RegisterUser').post(userController.registerUser)
userRoute.route('/login').post(userController.userLogin)
userRoute.route('/Userlist/:user').get(userController.userList)

module.exports = userRoute;