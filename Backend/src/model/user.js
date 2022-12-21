const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var UserSchema=new Schema({
    Username:String,
    Firstname:String,
    Lastname:String,
    Email:String,
    Password:String,
    Blocked_users:[String],
    Blocked_By:[String],
    Muted_users:[String],
    Muted_By:[String],
    privateRooms:[String],
    onlineStatus:String,
    newNotification:[String]
})

var UserData=mongoose.model('Users',UserSchema);

module.exports=UserData;