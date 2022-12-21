import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  usernm:any;
  notification:any;
  newmessagesBy:any=[]
  api="http://localhost:3000/api/chat"
  constructor(private http:HttpClient) { 
    if(this.newmessagesBy.length){
      this.notification=true
    }
  }
  getMessages(receiver:any,sender:any){
    // this.usernm=receiver
    return this.http.get<any>(this.api+'/message/'+receiver+'/'+sender);
  }
  sendMessage(receiver:any,sender:any,message:any){
    return this.http.post(this.api+'/sendmessage',{'receiver':receiver,'sender':sender,'message':message})
  }
  getGroupdetails(groupName:any){
    return this.http.get(this.api+'/groupDetails/'+groupName)

  }
  // newnotifications(){
  //   return (!!localStorage.getItem('newNotification'))
  // }
  newChat(user:any){
    return this.http.get(this.api+'/startnewchat/'+user)
  }
  blockUser(receiver:any,user:any){
    return this.http.post(this.api+'/blockUser',{"receiver":receiver,"user":user})
  }
  blockList(user:any){
    return this.http.get(this.api+'/blocklist/'+user)
  }
  unblockUser(receiver:any,user:any){
    return this.http.post(this.api+'/unblockUser',{"receiver":receiver,"user":user})
  }
  muteUser(receiver:any,user:any){
    return this.http.post(this.api+'/muteUser',{"receiver":receiver,"user":user})
  }
  muteList(user:any){
    return this.http.get(this.api+'/mutelist/'+user)
  }
  unmuteUser(receiver:any,user:any){
    return this.http.post(this.api+'/unmuteUser',{"receiver":receiver,"user":user})
  }
  CreatePrivateRoom(Userdetails:any,roomname:any){
    return this.http.post(this.api+'/newRoom',{"Roomname":roomname,"user":Userdetails})
  }
  getRooms(user:any){
    return this.http.get(this.api+'/roomdetails/'+user)
  }
  LeftGroup(user:any,group:any){
    return this.http.post(this.api+'/leftRoom',{"User":user,"Group":group})
    
  }
  DeleteGroup(user:any,group:any){
    return this.http.delete(this.api+'/deleteRoom/'+group)
    
  }
  CheckRoomname(Roomname:any){
    return this.http.post(this.api+'/checkRoomName/',{"RoomName":Roomname})

  } 
  notifications(){
    return !!this.notification
  }
  newnotifications(){
    this.notification=true
  }
  removenotifications(){
    // console.log(sender)
    this.notification=false
    console.log(this.newmessagesBy)
  }
  newmessagesrecieved(user:any){
    return this.http.get(this.api+'/newMessage/'+user)
  }
}
