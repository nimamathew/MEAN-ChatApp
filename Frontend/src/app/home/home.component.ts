import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { ChatService } from '../chat.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(public _auth:AuthService,private chatservice: ChatService) {
    this.chatservice.notifications()
   }

  ngOnInit(): void {
  //  this.notification();
  }
  
}
