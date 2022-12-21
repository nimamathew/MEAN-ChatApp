import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  username:any
  notification:any;
  api="http://localhost:3000/api/user"
  constructor(private http:HttpClient) { 
    
  }

  loginUser(user:any){
    return this.http.post<any>(this.api+'/login',{"userlogin":user})
  }
  userLoggedIn(){
    this.username=localStorage.getItem('username');
    return (!!localStorage.getItem('token'))
  } 
  
}
