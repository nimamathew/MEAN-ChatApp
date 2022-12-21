const chatData = require('../model/chat')
const privateRoomData = require('../model/privateroom')
const UserData = require('../model/user')


const getMessages = (req, res) => {
    chatData.find({ "sender": req.params.sender, "receiver": req.params.receiver }).then((data) => {
        res.send(data)
    })
}
const messageStore = (req, res) => {
    var messages = {
        sender: req.body.sender,
        receiver: req.body.receiver,
        message: req.body.message
    }
    var messages = chatData(messages);
    messages.save();
}
const blockUser = async (req, res) => {
    var user = req.body.user
    var blocking_user = req.body.receiver
    await UserData.updateOne(
        { Username: user },
        { $addToSet: { Blocked_users: blocking_user } }
    )
    await UserData.updateMany(
        { Username: blocking_user },
        { $addToSet: { Blocked_By: user } }
    )

}
const blocklist = async (req, res) => {
    var blocked = []
    await UserData.find({ "Username": req.params.user }).then((data) => {
        data.forEach(Element => {
            for (var i = 0; i < Element.Blocked_users.length; i++) {
                blocked.push(Element.Blocked_users[i])

            }
        })
    })

    UserData.find({ "Username": { $in: blocked } }).then((data) => {
        res.send(data)
    })
}
const unblockUser = async (req, res) => {
    var user = req.body.user
    var blocking_user = req.body.receiver

    await UserData.updateOne(
        { Username: user },
        { $pull: { Blocked_users: blocking_user } }
    ).then(data => {
        res.send(data)
    })
    await UserData.updateMany(
        { Username: blocking_user },
        { $pull: { Blocked_By: user } }
    )
}

const newChats = async (req, res) => {
    var blocked = []
    var blockedBy = []
    await UserData.find({ "Username": req.params.user }).then((data) => {

        data.forEach(Element => {
            for (var i = 0; i < Element.Blocked_users.length; i++) {
                blocked.push(Element.Blocked_users[i])

            }
            if (Element.Blocked_By) {
                for (var i = 0; i < Element.Blocked_By.length; i++) {
                    blockedBy.push(Element.Blocked_By[i])
                }
            }
        })

    })
    //   exclude recently interacted

    var RecentlyChatted = []
    const datas = await chatData.find(
        { "$or": [{ "User1": req.params.user }, { "User2": req.params.user }] }
    )
    datas.forEach(Element => {
        if (Element.User1 === req.params.user) {
            user = Element.User2
            // var chattingDetail={s}
            RecentlyChatted.push(user)
        }
        else {
            user = Element.User1
            RecentlyChatted.push(user)
        }
    })

    var blockedBy = blockedBy.concat(RecentlyChatted)
    var blocks = blocked.concat(blockedBy);
    await UserData.find({ "Username": { $nin: blocks, $ne: req.params.user } }).then((datas) => {

        res.send(datas)
    })
    // }
    UserData.find({ "Username": { $ne: req.params.user } }).then((datas) => {
    })


}
var checkRoomName=async (req, res) => {
    // console.log(req.body.RoomName)
    RoomName = req.body.RoomName
    const datas = await privateRoomData.find({ "RoomId": RoomName })
    if (datas.length > 0) {
        res.status(401).send('not available')
    }
    else if (datas.length == 0) {
        res.status(200).send('success');
    }

}

var getRoomDetails= async(req,res)=>{
    // console.log(req.params.groupname)
    privateRoomData.find({"RoomId":req.params.groupname}).then(data=>{
        res.send(data)
    })
}
var LeftRoom=async(req,res)=>{
    
}
var deleteRoom=async (req,res)=>{
   await privateRoomData.deleteOne({"RoomId":req.params.group})
   await UserData.updateMany({ $pull: { privateRooms: req.params.group } })
   await UserData.updateMany({ $pull: { newNotification: req.params.group } })
}

module.exports = {
    getMessages,
    messageStore,
    blockUser,
    unblockUser,
    blocklist,
    newChats,
    checkRoomName,
    getRoomDetails,
    LeftRoom,
    deleteRoom
}