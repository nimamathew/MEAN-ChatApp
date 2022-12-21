const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var blockedusersSchema=new Schema({
    Username:String,
    Blocked_users:String
})

var blockedusersData=mongoose.model('blocked_userr',blockedusersSchema);

module.exports=blockedusersData;