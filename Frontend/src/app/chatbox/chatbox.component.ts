import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import io from 'socket.io-client'
import { ChatService } from '../chat.service';
import { UserService } from '../user.service';
import * as $ from 'jquery';
import { ChatsectionComponent } from '../chatsection/chatsection.component';

declare var msg: any;
declare var sd: any;
const SOCKET_ENDPOINT = 'localhost:3000';
@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.css']
})
export class ChatboxComponent implements OnInit, OnChanges {
  @ViewChild(ChatsectionComponent) child: ChatsectionComponent;

  @Input() parentData: any;
  // @Input() rec=localStorage.getItem('receiver');
  socket = io(SOCKET_ENDPOINT);
  Userdetails: any = [];
  user = localStorage.getItem('username')
  message: any;
  blocklists: any = []
  MessageType: boolean
  receiver_id = this.route.snapshot.paramMap.get('id')
  receiver = this.route.snapshot.paramMap.get('receiver')
  GroupMessage: any
  RoomDetails: any
  groupdetails: any
  @Output('chatlist') updatechatlist: EventEmitter<any> = new EventEmitter();
  @Output('unblocklist') unblocklist: EventEmitter<any> = new EventEmitter();
  @Output('parentFun') blocklistUpdate: EventEmitter<any> = new EventEmitter();
  @Output('grouplist') updateGroupDetails: EventEmitter<any> = new EventEmitter();
  constructor(private route: ActivatedRoute, private userservice: UserService, private chatservice: ChatService) { }

  ngOnInit(): void {
    // console.log(this.receiver_id)
    this.route.queryParamMap.subscribe(params => {
    }
    );
  this.updateUserlist()
    this.socket.on('connection', () => {
    })
    this.SocketConnection();

    this.chatservice.blockList(this.user).subscribe(data => {
      this.blocklists = data
    }, res => { })
    // this.socket.emit("setup", this.user);
    this.socket.emit("join-chat", this.user)
  }
updateUserlist(){
  this.userservice.getUsers(this.user).subscribe(data => {
    this.Userdetails = data
  })
}
  // Check Box function
  checkedUsers = [];
  onCheck(evt) {
    if (!this.checkedUsers.includes(evt)) {
      this.checkedUsers.push(evt);
    } else {
      var index = this.checkedUsers.indexOf(evt);
      if (index > -1) {
        this.checkedUsers.splice(index, 1);
      }
    }
  }

  // form reset function
  resetForm() {
    this.checkedUsers = [];
  }
  // Message Forwarding function
  MsgForward() {
    var date = new Date();
    var time = date.toLocaleTimeString().substring(0, 10);
    var DateElement = date.toISOString().substring(0, 10);
    var frwrdMsg = ((document.getElementById('forward_msg') as HTMLInputElement).value)
    this.checkedUsers.forEach(Element => {
      var messageDatas = { sender: this.user, message: frwrdMsg, receiver: Element }
      this.socket.emit('new-message', messageDatas);
      // this.MsgSendFn(DateElement, time, frwrdMsg);
    })
    this.checkedUsers = [];
    $('#forward_msg').val('');
  }

  async ngOnChanges(changes: SimpleChanges) {
    for (let propName in changes) {
      let chng = changes[propName];
      let receiver_id = JSON.stringify(chng.currentValue);
    }
  }

  // Message sending function
  sendMessage() {
    var date = new Date();
    var time = date.toLocaleTimeString().substring(0, 10);
    var DateElement = date.toISOString().substring(0, 10);
    if (this.GroupMessage === true) {
      var messageDatas = { sender: this.user, message: this.message, receiver: this.RoomDetails };
      this.socket.emit('new-group-message', messageDatas);
    }
    else {
      var messageDatass = { sender: this.user, message: this.message, receiver: this.receiver };
      this.socket.emit('new-message', messageDatass);
    }
    this.MsgSendFn(DateElement, time, this.message);
    document.getElementById('chat-body').scrollTop = document.getElementById('chat-body').scrollHeight;
    this.message = '';
    this.updatechatlist.emit()
  }
  // Message sending common function
  MsgSendFn(DateElement, time, message) {
    const element = document.createElement('p');
    element.innerHTML = `<p class='mb-0'>
                                  <small> ${DateElement}<small class="ms-2">${time} |
                                   <label class='sender-name'> you  </label></small><br>
                                  </small>
                                  <button class="copy-btn" onclick="copy_text(\'${message}\')">
                                  <small> copy text</small>
                                  </button> ${message}</p> 
                                  <button  class="forward-text" onclick="forwardMsg(\'${message}',' ${this.user}\')">
                                  <img src="../../assets/images/forward.png">
                                  </button>`;
    element.classList.add('MyMsg');
    document.getElementById('chat-content')?.appendChild(element)
  }

  // Recieved Message function common
  ReceivedMsg(DateElement, time, message, sender, alertmsg) {
    const element = document.createElement('p');
    if (alertmsg === true) {
      element.innerHTML = `<p>
                          <small> ${DateElement} <small"><br>${time}</small><br></small>
                                   <span>${message}</span></p>`;
      element.classList.add('receivedMsg-alert')
    }
    else {
      element.innerHTML = `
                         <p><label class='sender-name'>${sender} | </label>
                          <small> ${DateElement}<br> <small class="ms-2">${time}</small><br></small>
                          <button class="copy-btn" onclick="copy_text(\'${message}\')">
                          <small> copy text</small>
                          </button>
                                   ${message}
                                  
                                   </p> 
                                  <button  class="forward-text" onclick="forwardMsg(\'${message}',' ${this.user}\')">
                                  <img src="../../assets/images/forward.png">
                                  </button>`;
      element.classList.add('receivedMsg')
    }
    document.getElementById('chat-content')?.appendChild(element)
  }

  // view Group messages
  viewGroupMessage(RoomDetails: any, sender: any, type: any) {
    this.chatservice.getGroupdetails(RoomDetails.RoomId).subscribe(data => {
      this.groupdetails = data
    })

    console.log(RoomDetails)
    this.RoomDetails = RoomDetails.RoomId
    this.MessageType = type;
    this.receiver = RoomDetails.RoomId
    this.GroupMessage = true
    setTimeout(() => {
      document.getElementById('chat-content').innerHTML = ''
      this.socket.emit('get-group-message', this.RoomDetails);
      this.socket.on('display-group-message', data => {
        if (data.length) {
          data.forEach(element => {
            element.MessageDetails.forEach(MsgData => {
              var date = new Date(MsgData.time);
              var time = date.toLocaleTimeString().substring(0, 11);
              var DateElement = date.toISOString().substring(0, 10);
              var message = MsgData.message
              if (this.user === MsgData.sender) {
                var elements = document.createElement('div');
                // elements.innerHTML = ''
                this.MsgSendFn(DateElement, time, message);
                document.getElementById('chat-body').scrollTop = document.getElementById('chat-body').scrollHeight;
              }
              else {
                var elementss = document.createElement('div');
                elementss.innerHTML = ''
                if (MsgData.messageType === 'alert') {
                  this.ReceivedMsg(DateElement, time, message, MsgData.sender, true)
                }
                else {
                  this.ReceivedMsg(DateElement, time, message, MsgData.sender, false)
                }
                // elementss.innerHTML = '<p><small>' + DateElement + ' <small class="me-2">' + time + ' </small></small><br>' + element.message + '</p> ';            // elementss.innerHTML = element.message;
                // elementss.classList.add('receivedMsg')
                // document.getElementById('chat-content')?.appendChild(elementss)
                document.getElementById('chat-body').scrollTop = document.getElementById('chat-body').scrollHeight;
              }
            })


          });

          data.length = 0
        }
      })
    }, 50);
  }
  getGroupDetails(e, receiver: any) {
    msg()
    e.preventDefault();
    this.chatservice.getGroupdetails(receiver).subscribe(data => {
      this.groupdetails = data
    })
  }
  // view Messages
  ViewMessage(reciever: any, sender: any, type: any) {
    this.receiver = reciever
    this.updateUserlist()
    setTimeout(() => {
      this.MessageType = type;
      this.GroupMessage = false
      var messageDatas = { sender: sender, message: this.message, receiver: reciever };
      document.getElementById('chat-content').innerHTML = ''
      this.socket.emit('user', messageDatas);
      this.socket.on('old-message', (data: any) => {
        if (data.length) {
          data.forEach(element => {
            element.MessageDetails.forEach(MsgData => {
              var date = new Date(MsgData.time);
              var time = date.toLocaleTimeString().substring(0, 11);
              var DateElement = date.toISOString().substring(0, 10);
              var message = MsgData.message
              if (this.user === MsgData.sender) {
                var elements = document.createElement('div');
                this.MsgSendFn(DateElement, time, message);
                document.getElementById('chat-body').scrollTop = document.getElementById('chat-body').scrollHeight;
              }
              else {
                var elementss = document.createElement('div');
                elementss.innerHTML = ''
                this.ReceivedMsg(DateElement, time, message, MsgData.sender, false)
                document.getElementById('chat-body').scrollTop = document.getElementById('chat-body').scrollHeight;
              }
            })


          });

          data.length = 0
        }
      })
    }, 50);
  }
  // Setting socket connection for receiving messages live
  SocketConnection() {
    let audio = new Audio()
    audio.src = '../../assets/message_alert.mp3'
    this.socket.on('message', (data: any, any, any2, msgtype) => {
      var date = new Date();
      var time = date.toLocaleTimeString().substring(0, 11);
      var DateElement = date.toISOString().substring(0, 10);
      if (this.GroupMessage === true) {
        if (data.receiver === this.receiver) {
          const element = document.createElement('p');
          if (msgtype === 'alertmsg') {
            this.ReceivedMsg(DateElement, time, data.message, data.sender, true)
          }
          else {
            this.ReceivedMsg(DateElement, time, data.message, data.sender, false)
          }
          document.getElementById('chat-content')?.appendChild(element)
          document.getElementById('chat-body').scrollTop = document.getElementById('chat-body').scrollHeight;

        }
      }
      else {
        if (data && data.receiver === this.user) {
          if (data.sender === this.receiver) {
            const element = document.createElement('p');
            this.ReceivedMsg(DateElement, time, data.message, data.sender, false)
            document.getElementById('chat-content')?.appendChild(element)
            document.getElementById('chat-body').scrollTop = document.getElementById('chat-body').scrollHeight;
            audio.play();
          }
          else {
            audio.play();
          }
        }
      }
    })
  }

  LeaveGroup() {
    this.socket.emit('leaveGroup', this.user, this.receiver)
    this.receiver = ''
    this.updateGroupDetails.emit()
    // this.chatservice.LeftGroup(this.user,this.receiver).subscribe(data => {
    // }, res => {

    // })
  }
  DeleteGroup() {
    this.updateGroupDetails.emit()
    this.chatservice.DeleteGroup(this.user, this.receiver).subscribe(data => {
      // this.updateGroupDetails.emit()
    }, res => {

    })

    this.receiver = ''
  }
  blockUser() {
    // this.socket.emit('updateList')
    this.chatservice.blockUser(this.receiver, this.user).subscribe(data => {
      this.blocklists = data
    }, res => { })
    this.receiver = ''
    this.updateUserlist()
    this.blocklistUpdate.emit();
  }
  unblockUser() {
    this.chatservice.unblockUser(this.receiver, this.user).subscribe(data => {
    }, res => {

    })
    this.receiver = ''
    this.unblocklist.emit()
  }
}


