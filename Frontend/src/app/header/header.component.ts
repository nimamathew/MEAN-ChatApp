import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import io from 'socket.io-client'
import { not } from '@angular/compiler/src/output/output_ast';
import { ChatService } from '../chat.service';

const SOCKET_ENDPOINT = 'localhost:3000';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  socket = io(SOCKET_ENDPOINT);
  user = localStorage.getItem('username')
  constructor(public _auth: AuthService, private _router: Router, public chatService: ChatService) { }
  newNotification: any
  notifications: any
  recieved_notification:any =[]
  notificationNumbers:any
  ngOnInit(): void {
    // this.socket.emit("setup", this.user);
    this._auth.userLoggedIn()
    this.socket.emit("join-chat", this._auth.username)
    this.socket.on('connection', () => {
    })
    this.notification();
    this.removenotification()
    this.receivedmessageNotification(this.user)
  }

  ngOnDestroy() {

  }
  receivedmessageNotification(user:any){
    this.chatService.newmessagesrecieved(user).subscribe(data => {
      this.chatService.newmessagesBy = data
      this.notificationNumbers=data
      
    // console.log(this.notificationNumbers)
    this.notificationNumbers.newNotification.forEach(Element=>{
      this.chatService.newnotifications()
      // console.log(Element)
    })
    // this.chatService.newnotifications(this.notificationNumbers)
    })
    this.socket.on('notificationalert',data=>{
      data.forEach(element=>{
        element.forEach(newmessage=>{
        // this.chatService.newmessagesBy.push(newmessage)
        })
      })
    })
  }
  logout() {
    this.socket.disconnect()
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this._router.navigate(['/'])
    
  }
  
  // remove(){
  //   this._auth.removenotifications()
  // }
  notification() {
    this.socket.on('message', (data,sendUser,msgtype) => {
      let audio = new Audio()
      audio.src = '../../assets/message_alert.mp3'
      audio.play();
      this.chatService.newnotifications();
    })

  }
  removenotification() {
    var user = this.user
    this.socket.emit('getnotification', user)
  }
}
