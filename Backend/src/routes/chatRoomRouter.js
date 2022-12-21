
const privateRoomData=require('../model/privateroom')
const UserData = require('./model/user')

socket.on('createRoom',async (data,RoomName)=>{
    console.log(RoomName)
    var RoomDetails={
        RoomId:RoomName,
        Admin:String,
        Members:data,
    }
    RoomDetails=privateRoomData(RoomDetails);
    RoomDetails.save()
    for(var i=0;i<data.length;i++){
        console.log(data[i])
      await  UserData.updateMany(
                { Username: data[i] },
                { $addToSet: { privateRooms: RoomName } }
            )
    }
})
module.exports=Chatroomroute