const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');

var app = new express();
app.use(bodyparser.json());
app.use(cors());
const http = require('http');
const server = http.createServer(app)
const { Server } = require('socket.io');
mongoose.connect('mongodb://0.0.0.0:27017/NimaChatApp');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:4200',
        methods: ["GET", "POST"]
    }
})
const UserData = require('./src/model/user')

const userRoute = require('./src/routes/userRouter');
const chatRoute = require('./src/routes/chatRouter')
const socketRoute= require('./src/controller/socketController')

app.use('/api/user', userRoute);
app.use('/api/chat', chatRoute);
io.on("connection", socketRoute.socketEvents)

app.get('/api/chat/newMessage/:user',async (req,res)=>{
    console.log(req.params.user)
    newNotificationsBy=[]
        await UserData.find({ 'Username': req.params.user }).then(data => {
            data.forEach(datas=>{
                res.send(datas)
            })
           
        })
})
server.listen(3000, () => {
    console.log('server running')
})
