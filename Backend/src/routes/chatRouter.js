const express = require('express');
const chatController = require('../controller/chatController')
const chatRoute = express.Router();

// Employee model

chatRoute.route('/message/:receiver/:sender').get(chatController.getMessages)
chatRoute.route('/chat/sendmessage').post(chatController.messageStore)
chatRoute.route('/blockUser').post(chatController.blockUser)
chatRoute.route('/unblockUser').post(chatController.unblockUser)
chatRoute.route('/blocklist/:user').get(chatController.blocklist)
chatRoute.route('/startnewchat/:user').get(chatController.newChats)
chatRoute.route('/startnewchat/:user').get(chatController.newChats)


chatRoute.route('/checkRoomName/').post(chatController.checkRoomName)
chatRoute.route('/groupDetails/:groupname').get(chatController.getRoomDetails)
chatRoute.route('/leftRoom').post(chatController.LeftRoom)
chatRoute.route('/deleteRoom/:group').delete(chatController.deleteRoom)
// chatRoute.route('/RegisterUser').post(userController.registerUser)
// chatRoute.route('/login').post(userController.userLogin)

module.exports = chatRoute;