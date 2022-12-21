const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var chatSchema=new Schema({
    RoomId:String,
    User1:String,
    User2:String,
   MessageDetails:[{
    sender:String,
    receiver:String,
    message:String,
    time : { type : Date, default: Date.now }
   }],
   lastMessage:String,
   lastMessageTime:Date,

})

var chatData=mongoose.model('messages',chatSchema);

module.exports=chatData;