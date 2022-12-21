const mongoose=require('mongoose');
const Schema=mongoose.Schema;

var mutedusersSchema=new Schema({
    Username:String,
    Muted_users:String
})

var mutedusersData=mongoose.model('muted_userr',mutedusersSchema);

module.exports=mutedusersData;