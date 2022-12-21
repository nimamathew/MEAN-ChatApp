import { Component, OnInit } from '@angular/core';
import { UserService } from '../user.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import * as $ from 'jquery';
import io from 'socket.io-client'
import { ChatService } from '../chat.service';

const SOCKET_ENDPOINT = 'localhost:3000';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  socket = io(SOCKET_ENDPOINT);
  Cnfmpswd: any
  login_error: any
  images: any
  User = {
    loginusername: '',
    loginpassword: '',
  }
  usernameavailability
  notificationNumbers: any
  signupalert: any;
  userForm = new FormGroup({
    firstname: new FormControl('', [Validators.required]),
    lastname: new FormControl('', Validators.required),
    username: new FormControl('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,15})$')]),
    password: new FormControl('', [Validators.pattern("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}"), Validators.required]),
    cPassword: new FormControl('', [Validators.required])
  },
  )
  pwdMatchValidator() {
    if ((this.userForm.get('cPassword').value.length) > 1) {
      if (this.userForm.get('password').value === this.userForm.get('cPassword').value) {
        this.Cnfmpswd = true
        this.userForm.valid
      }
      else {
        this.Cnfmpswd = false
        this.userForm.invalid
      }

    }

  }
  constructor(private UserService: UserService, private auth: AuthService, private _router: Router, private chatService: ChatService) { }

  ngOnInit(): void {
  }
  signup() {
    this.UserService.RegisterUser(this.userForm.value)
    this.signupalert = true
    setTimeout(function () {
      $("#login-tab").click();
    }, 2000);
  }
  login() {
    this.chatService.notifications()
    this.auth.loginUser(this.User).subscribe(res => {
      localStorage.setItem('token', res.token)
      localStorage.setItem("username", this.User.loginusername.toString());
    this.auth.username=this.User.loginusername
      this._router.navigate(['/']); 
      setTimeout(() => {
        window.location.reload()
      }, 30);
      this.chatService.newmessagesrecieved(this.User.loginusername).subscribe(data => {
      this.socket.emit("join-chat", this.User.loginusername)
        this.chatService.newmessagesBy = data
        this.notificationNumbers=data
      this.notificationNumbers.newNotification.forEach(Element=>{
        this.chatService.newnotifications()
      })

      }, err => {
        this.login_error = true
        setTimeout(() => { this.login_error = false }, 4000)
      }
      )
    })
  }

  usernameAvailabilitycheck() {
      var user = this.userForm.get('username').value
    if(user.length > 0){
      this.UserService.usernameAvailability(user).subscribe((data) => {
        user = JSON.parse(JSON.stringify(data));
      }, err => {
        if (err.status == 200) {
          this.usernameavailability = false

        }
        else if (err.status == 401) {
          this.usernameavailability = true
        }
      })
    }
  }
}
