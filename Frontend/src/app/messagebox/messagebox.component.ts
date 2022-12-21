import { Component, DoCheck, OnInit } from '@angular/core';
import { ChatService } from '../chat.service';
import io from 'socket.io-client'
import { ActivatedRoute } from '@angular/router';

const SOCKET_ENDPOINT = 'localhost:3000';
@Component({
  selector: 'app-messagebox',
  templateUrl: './messagebox.component.html',
  styleUrls: ['./messagebox.component.css']
})
export class MessageboxComponent implements OnInit, DoCheck {
  socket = io(SOCKET_ENDPOINT);

  user = localStorage.getItem('username')
  message: any;
  receiver = this.route.snapshot.paramMap.get('username')

  // ss=this.route.queryParamMap('receiver');
  messageData = [{
    sender: '',
    receiver: '',
    message: ''
  }]
  constructor(public chatService: ChatService, private route: ActivatedRoute) { }
  ngDoCheck(): void {
    console.log('dsadsa')
    throw new Error('Method not implemented.');
  }

  ngOnInit(): void {
    this.setSocketConnection();
    // this.chatService.getMessages(this.receiver,this.user).subscribe(data=>{
    //   this.messageData=data
    // })
    this.received();

  }
  received() {
    var messageDatas = { sender: this.user, message: this.message, receiver: this.receiver };
    this.socket.emit('user', messageDatas);
    this.socket.on('old-message', (data: any) => {
      if (data.length) {
        data.forEach(element => {

          if (this.user === element.sender) {
            const elements = document.createElement('p');
            elements.innerHTML = element.message;
            elements.classList.add('MyMsg')
            document.getElementById('chat-content')?.appendChild(elements)
          }
          else {
            const elementss = document.createElement('p');
            elementss.innerHTML = element.message;
            elementss.classList.add('receivedMsg')
            document.getElementById('chat-content')?.appendChild(elementss)
            document.getElementById('chat-body').scrollTop = document.getElementById('chat-body').scrollHeight;

          }


        });
      }
    })


  }

  setSocketConnection() {
    let audio = new Audio()
    audio.src = '../../assets/message_alert.mp3'
    this.socket.on('message', (data: string) => {
      if (data) {
        const element = document.createElement('p');
        element.innerHTML = data;
        element.classList.add('receivedMsg')
        document.getElementById('chat-content')?.appendChild(element)
        document.getElementById('chat-body').scrollTop = document.getElementById('chat-body').scrollHeight;
        audio.play();
      }
    })
  }
  sendMessage() {
    // this.socket=io(SOCKET_ENDPOINT);
    var messageDatas = { sender: this.user, message: this.message, receiver: this.receiver };
    this.socket.emit('chatmessage', messageDatas);
    const element = document.createElement('p');
    element.innerHTML = this.message;
    element.classList.add('MyMsg')
    document.getElementById('chat-content')?.appendChild(element)
    document.getElementById('chat-body').scrollTop = document.getElementById('chat-body').scrollHeight;
    this.message = '';
  }
  blockUser() {
    this.chatService.blockUser(this.receiver, this.user).subscribe(data => {
    })
  }
}
