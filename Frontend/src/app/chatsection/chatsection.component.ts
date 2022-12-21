import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../chat.service';
import { UserService } from '../user.service';
import io from 'socket.io-client'
import { ChatboxComponent } from '../chatbox/chatbox.component';
import * as $ from 'jquery';

declare var $: any;
const SOCKET_ENDPOINT = 'localhost:3000';
const room_name='ROOM 1';
@Component({
  selector: 'app-chatsection',
  templateUrl: './chatsection.component.html',
  styleUrls: ['./chatsection.component.css'],
})
export class ChatsectionComponent implements OnInit {
  @ViewChild(ChatboxComponent) child: ChatboxComponent;
  data: any
  blocklists: any = []
  blocked: any;
  mutelists: any = []
  muted: any;
  socket = io(SOCKET_ENDPOINT);
  message: any = [];
  Userdetails: any = [];
  receiever: any
  sender = localStorage.getItem('username');
  RoomName: any;
  checkedUserss = []
  newNotification: any;
  RecentlyChatted: any
  RoomDetails: any = []
  newmessageSender: any = []
  chatDataType: any;
  notificationNumbers: any = []
  newnotificationsenders: any = []
  newMessageNotification: any;
  newGroupmsg:any
  GroupnameAvailability:any
  constructor(private chatservice: ChatService, private userservice: UserService, private router: Router, private route: ActivatedRoute) { }


  ngOnInit(): void {
    this.socket.emit("join-chat", this.sender)
    this.socket.on('connection', () => {
    })

    this.availablechatrooms();
    this.RecentlyInteracted();
    this.notification();
    this.receivedmessageNotification(this.sender)

  }
  receivedmessageNotification(user: any) {
    this.chatservice.newmessagesrecieved(user).subscribe(data => {
      this.chatservice.newmessagesBy = data
      this.notificationNumbers = data

      this.notificationNumbers.newNotification.forEach(Element => {
        if (this.newmessageSender.indexOf(Element) == -1) {
          this.newmessageSender.push(Element)
          this.chatservice.newnotifications()

        }
      })
      // this.chatservice.newnotifications(this.notificationNumbers)
    })
    this.socket.on('notificationalert', data => {
      data.forEach(element => {
        element.forEach(newmessage => {
          // this.chatservice.newmessagesBy.push(newmessage)
        })
      })
    })
  }
  notification() {
    this.socket.on('updateList',data=>{
      console.log('sdds')
    })
    this.socket.on('message', (data, sendUser,msgtype) => {
      // alert(msgtype)
      console.log(data)
     this.sortchats(data,sendUser,msgtype)
      
    })


  }
sortchats(data,sendUser,msgtype){
  if(msgtype!='group'){
    this.newMessageNotification = data
    // this.newmessageSender=data.sender
    if (this.newmessageSender.indexOf(data.sender) == -1) {
      this.newmessageSender.push(data.sender)
    }
    var id = ''
    sendUser.forEach(sender => {
      id = sender._id
    })
    this.Userdetails.forEach((value, index) => {
      if (value._id == id) this.Userdetails.splice(index, 1);
    });
    this.Userdetails.push.apply(sendUser, this.Userdetails)
    this.Userdetails = sendUser
  }
  else{
    this.newGroupmsg=true
    this.newMessageNotification = data
    this.availablechatrooms()
    // console.log(this.RoomDetails)
    if (this.newmessageSender.indexOf(data.receiver) == -1) {
      this.newmessageSender.push(data.receiver)
    }
  }
}
  chatToggle() {
    if ($("#flexSwitchCheckChecked").is(":checked", true)) {
      $('.user-list').addClass('show')
      this.RecentlyInteracted();
    }
    else {
      $('.user-list').addClass('show')
      this.newChat()
    }
  }
  updatechatlist(){
    setTimeout(() => {
      this.RecentlyInteracted()
      this.availablechatrooms()
    }, 40);
  }
  // Recently Interacted List
  async RecentlyInteracted() {
    this.chatDataType = false
    this.socket.emit('recently-chated', this.sender)
    const CORRECT_ORDER = []
    const UNSORTED = [];
    this.socket.on('lastMessage', lastmessageData => {
      lastmessageData.forEach(data => {
        CORRECT_ORDER.push(data)
      })
    })
    this.socket.on('recently-chated-users', (data) => {
      this.Userdetails = data
      data.forEach(recentUsers => {
        UNSORTED.push(recentUsers)
      })
    })

setTimeout(()=>{
var sorted = []
   
    CORRECT_ORDER.forEach(k => {
      UNSORTED.forEach(obj => {
        if (obj.Username === k) {
          sorted.push(obj);
        }
      })
    }) 
    this.Userdetails=sorted
  }, 300);
    

  }
  
  // Start new chat
  newChat() {
    this.chatDataType = true
    this.chatservice.newChat(this.sender).subscribe(data => {
      this.Userdetails = data
    })
  }

  // Get recent chat history
  getMessage(receiever: any, type: any) {
    this.newmessageSender.forEach(newmessageBy => {
      if (newmessageBy === receiever.Username) {
        this.socket.emit('removeNotification', receiever.Username, this.sender)
        const index = this.newmessageSender.indexOf(newmessageBy);
        if (index > -1) { // only splice array when item is found
          this.newmessageSender.splice(index, 1); // 2nd parameter means remove one item only
        }
        if (this.newmessageSender.length === 0) {
          this.chatservice.removenotifications()
        }
      }
    })

    this.child.ViewMessage(receiever.Username, this.sender, type);
    this.data = receiever._id
    this.socket.on('remove', data => {
      // this.newNotification=localStorage.removeItem('newNotification')
      // this.notifications=false
      // console.log('asdasdas'+data)
    })
  }

  // Get Blocked user details
  blockedDetails() {
    this.chatservice.blockList(this.sender).subscribe(data => {
      this.blocklists = data
      this.blocked = true;
    })
  }

  mutedDetails() {
    this.chatservice.muteList(this.sender).subscribe(data => {
      this.mutelists = data
      this.muted = true;
    })
  }

  blocklistUpdate(){
    setTimeout(()=>{
      this.availableUsers()
    },200)
  }
  
  mutelistUpdate(){
    setTimeout(()=>{
      this.availableUsers()
    },200)
  }
  unblockblocklistUpdate(){
    setTimeout(()=>{
      this.blockedDetails()
    },200)
  }
  unmutemutelistUpdate(){
    setTimeout(()=>{
      this.mutedDetails()
    },200)
  }
  updateGroupDetails(){
    setTimeout(()=>{
      this.availablechatrooms()
    },200)
  }
  // availabel users for chat
  availableUsers() {
    this.RecentlyChatted = false
    this.RecentlyInteracted();
  }

  // check room name availability
  RoomNameAvailability(){
    // var roomname = ((document.getElementById('room_name') as HTMLInputElement).value)
    var roomname =  room_name;
    // room_name
    // alert(roomname)
      this.chatservice.CheckRoomname(roomname).subscribe(data=>{
      
        }, err => {
          if (err.status == 200) {
            this.GroupnameAvailability = false
  
          }
          else if (err.status == 401) {
            this.GroupnameAvailability = true
          }
        })
  }
  // chat rooms available
  availablechatrooms() {
    this.chatDataType = false
    this.socket.emit('getroomdetails', this.sender)
    this.socket.on('Roomdetails', (data) => {
      this.RoomDetails = data
    })
  }

  // Create new chat room modal popup
  // createChatroom() {
  //   $('#CreateRoomModal').modal('show');
  //   this.userservice.getUsers(this.sender).subscribe(data => {
  //     this.Userdetails = data
  //   })
  // }

  // Create new chat room form submit
  // createRoom() {
  //   this.RoomName = ((document.getElementById('room_name') as HTMLInputElement).value)
  //   this.socket.emit("createRoom", this.checkedUserss, this.RoomName, this.sender);
  //   setTimeout(() => {
  //     this.availablechatrooms()
  //   }, 200);
  // }

  // recent chat room messages  
  getChatRoomMessages(RoomDetails: any, ChatType: any) {
    console.log(RoomDetails)
    this.newmessageSender.forEach(newmessageBy => {
      if (newmessageBy === RoomDetails.RoomId) {
        this.socket.emit('removeNotification', RoomDetails.RoomId, this.sender)
        const index = this.newmessageSender.indexOf(newmessageBy);
        if (index > -1) { // only splice array when item is found
          this.newmessageSender.splice(index, 1); // 2nd parameter means remove one item only
        }
        if (this.newmessageSender.length === 0) {
          this.chatservice.removenotifications()
        }
      }
    })
    this.child.viewGroupMessage(RoomDetails, this.sender, ChatType);
  }

  // form reset function
  resetForm() {
    this.checkedUserss = [];
  }

  // checkbox function
  onCheck(evt) {
    if (!this.checkedUserss.includes(evt)) {
      this.checkedUserss.push(evt);
    } else {
      var index = this.checkedUserss.indexOf(evt);
      if (index > -1) {
        this.checkedUserss.splice(index, 1);
      }
    }
  }
}
