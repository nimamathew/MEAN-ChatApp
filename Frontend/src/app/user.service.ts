import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  api="http://localhost:3000/api/user"
  constructor(private http:HttpClient) { }
  RegisterUser(User:any){
    this.http.post(this.api+'/RegisterUser',{"User":User}).subscribe((data)=>{
    })
  }
  getUsers(user:any){
   return this.http.get(this.api+'/Userlist/'+user)
  }
  usernameAvailability(user:any){
    return this.http.get(this.api+'/usernameAvailability/'+user)
  }
}
