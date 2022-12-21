
const UserData = require('../model/user')
const chatData = require('../model/chat')
const privateRoomData = require('../model/privateroom')
const users = {};

const socketEvents = (socket) => {
    // console.log(socket);

    socket.on('recently-chated', async (data) => {
        var blocked = []
        var blockedBy = []
        await UserData.find({ "Username": data }).then((data) => {

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
        var blocks = blocked.concat(blockedBy)

        const datas = await chatData.find(
            { "$or": [{ "User1": data }, { "User2": data }] }
        ).sort({ lastMessageTime: -1 })
        var RecentlyChatted = []
        datas.forEach(Element => {
            if (Element.User1 === data) {
                user = Element.User2
                // var chattingDetail={s}
                RecentlyChatted.push(user)
            }
            else {
                user = Element.User1
                RecentlyChatted.push(user)
            }
        })
        socket.emit('lastMessage', RecentlyChatted)
        await UserData.find({ "Username": { $in: RecentlyChatted, $nin: blocks } }).then((recentData) => {
            // res.send(data)\
            socket.emit('recently-chated-users', recentData)
        })
    })

    socket.on('new-group-message', async data => {

        groupmembers = []
        await privateRoomData.find({ "RoomId": data.receiver }).then(datas => {
            datas.forEach(Element => {
                Element.Members.pull(data.sender);
                Element.Members.forEach(Members => {
                    groupmembers.push(Members)
                    socket.to(Members).emit("message", data, data.receiver, 'group');
                })
            })
        })
        await UserData.updateMany(
            { "Username": groupmembers },
            {
                $addToSet: {
                    newNotification: data.receiver
                }
            }
        )
        await privateRoomData.updateOne(
            { "RoomId": data.receiver },
            {
                $addToSet: {
                    MessageDetails: {
                        "message": data.message,
                        "sender": data.sender,
                    }
                },
                lastMessageTime: new Date()

            }
        )
    })
    socket.on('removeNotification', data => {
        socket.emit('remove', data)
    })
    socket.on('get-group-message', async RoomId => {
        await privateRoomData.find({ "RoomId": RoomId }).then(data => {
            socket.emit('display-group-message', data)
        })
    })
    
    socket.on('join-chat', async function (receiver) {
        console.log('a user ' + receiver + ' connected');
        room = receiver
        users[socket.id] = receiver;

        socket.join(room)
        await UserData.updateOne(
            { "Username": receiver },
            {
                onlineStatus: 'online'
            }
        )
    });

    socket.on('disconnect', async function () {
        console.log('user ' + users[socket.id] + ' disconnected');
        
        await UserData.updateOne(
            { "Username": users[socket.id] },
            {
                onlineStatus: 'offline'
            }
        )
        // delete users[socket.id];
    });
    
    socket.on('getnotification', async user => {
        newNotificationsBy = []
        await UserData.find({ 'Username': user }).then(data => {
            data.forEach(datas => {
                newNotificationsBy.push(datas.newNotification)
            })

        })
        await socket.emit('notificationalert', newNotificationsBy)

    })
    socket.on('removeNotification', async (receiver, sender) => {
        console.log(receiver)
        console.log(sender)
        await UserData.updateMany(
            { Username: sender },
            { $pull: { newNotification: receiver } }
        )
    })
    socket.on('new-message', async (data) => {
        sendUser = []
        console.log(data)
        await UserData.find({ 'Username': data.sender }).then(User => {
            sendUser = User
        })
        socket.to(data.receiver).emit('message', data, sendUser);
        await UserData.updateOne(
            { "Username": data.receiver },
            {
                $addToSet: {
                    newNotification: data.sender
                }
            }
        )
        const datas = await chatData.findOne({
            'User1': data.sender,
            'User2': data.receiver
        }
        )
        const datas1 = await chatData.findOne({
            'User1': data.receiver,
            'User2': data.sender
        })

        if (!datas && !datas1) {
            chatData.insertMany({
                "RoomId": ((new Date()).getTime().toString(36) + Math.random()).toString(36).slice(2),
                User1: data.sender,
                User2: data.receiver,
                MessageDetails: {
                    "message": data.message,
                    "sender": data.sender,
                    "receiver": data.receiver
                },
                lastMessage: data.message,
                lastMessageTime: new Date()

            })
        }
        var RoomId = []
        if (datas1) {
            RoomId.push(datas1.RoomId);
        }
        if (datas) {
            RoomId.push(datas.RoomId);
        }
        if (datas || datas1) {
            await chatData.updateOne(
                { "RoomId": RoomId },
                {
                    $addToSet: {
                        MessageDetails: {
                            "message": data.message,
                            "sender": data.sender,
                            "receiver": data.receiver
                        }
                    },
                    $set: {
                        lastMessage: data.message,
                        lastMessageTime: new Date(),
                    }
                }

            )
        }


    })
    socket.on('createRoom', async (data, RoomName, admin) => {
        data.push(admin)
        var RoomDetails = {
            RoomId: RoomName,
            Admin: admin,
            Members: data
        }
        RoomDetails = privateRoomData(RoomDetails);
        RoomDetails.save()
        for (var i = 0; i < data.length; i++) {
            console.log(data[i])
            await UserData.updateMany(
                { Username: data[i] },
                { $addToSet: { privateRooms: RoomName } }
            )
        }

        const index = data.indexOf(admin);
        if (index > -1) {
            data.splice(index, 1);
        }
        await UserData.updateMany(
            { "Username": data },
            {
                $addToSet: {
                    newNotification: RoomName
                }
            }
        )
        await privateRoomData.updateOne(
            { "RoomId": RoomName },
            {
                $addToSet: {
                    MessageDetails: {
                        "message": 'New Group created by ' + admin,
                        "messageType":"alert"
                    }
                },
                lastMessageTime: new Date()
            }
        )
        messageData = { 'sender': admin, 'message': 'New Group '+RoomName+' created by ' + admin, 'receiver': RoomName }
        socket.to(data).emit("message",  messageData,RoomName, 'group','alertmsg');

    })


    socket.on('leaveGroup', async (user, groupname) => {
        messageData = { 'sender': user, 'message': user + ' left the chat', 'receiver': groupname }
        await privateRoomData.find({ "RoomId": groupname }).then(datas => {
            datas.forEach(Element => {
                Element.Members.pull(user);
                Element.Members.forEach(Members => {
                    socket.to(Members).emit("message", messageData, groupname, 'group','alertmsg');
                })
            })
        })

        await privateRoomData.updateOne(
            { "RoomId": groupname },
            {
                $addToSet: {
                    MessageDetails: {
                        "message": user + ' left the chat',
                        "messageType":"alert"
                    }
                },
                lastMessageTime: new Date()
            }
        )
        await privateRoomData.updateMany(
            { "RoomId": groupname },
            { $pull: { Members: user } }
        )
        await UserData.updateMany(
            { Username: user },
            { $pull: { privateRooms: groupname } }
        )
    })
    socket.on('getroomdetails', (user) => {

        privateRoomData.find({ "$or": [{ "Members": user }, { "Admin": user }] }).sort({ lastMessageTime: -1 }).then(data => {
            socket.emit('Roomdetails', data)
        })
    })
    socket.on('user', (data) => {
        chatData.find({ "$or": [{ "User1": data.sender, "User2": data.receiver }, { "User1": data.receiver, "User2": data.sender }] }).then(result => {

            if (result) {
                socket.emit("old-message", result);
            }
        })

    })

}

module.exports = {
    socketEvents
}