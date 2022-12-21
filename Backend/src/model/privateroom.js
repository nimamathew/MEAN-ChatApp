const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var privateRoomSchema=new Schema({
    RoomId:String,
    Admin:String,
    Members:[String],
    lastMessageTime: {type : Date},
    MessageDetails:[{
        sender:String,
        receiver:String,
        message:String,
        messageType:String,
        time : { type : Date, default: Date.now }
       }]
})

var privateRoomData=mongoose.model('PrivateRooms',privateRoomSchema);

module.exports=privateRoomData;