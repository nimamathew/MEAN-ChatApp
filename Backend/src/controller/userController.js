const UserData = require('../model/user')
const jwt = require('jsonwebtoken');

const registerUser = (req, res) => {
    data = req.body.User
    var UserDetails = {
        Firstname: data.firstname,
        Lastname: data.lastname,
        Username: data.username,
        Email: data.email,
        Password: data.password,
        onlineStatus: 'offline'
    }
    var UserDetails = new UserData(UserDetails)
    UserDetails.save();
}

const userLogin = (req, res) => {
    user = req.body.userlogin
    UserData.findOne({ "Username": user.loginusername, "Password": user.loginpassword }).then((data) => {
        if (data === null) {
            res.status(401).send('Invalid Username and password!!')
        }
        else if (data.Username === user.loginusername && data.Password === user.loginpassword) {
            let payload = { subject: user.loginusername + user.loginpassword }
            let token = jwt.sign(payload, 'secretKey')
            let username = data.Username;
            res.status(200).send({ token, username })
        }
        else {
            res.status(401).send('Invalid Username and password!!')
        }
    })
}

const checkUsername = async (req, res) => {
    username = req.params.user
    const datas = await UserData.find({ "Username": username })
    if (datas.length > 0) {
        res.status(401).send('not available')
    }
    else if (datas.length == 0) {
        res.status(200).send('success');
    }

}
const userList = async (req, res) => {
    var blocked = []
    var blockedBy = []
    await UserData.find({ "Username": req.params.user }).then((data) => {

        data.forEach(Element => {
            // console.log(Element.Blocked_users.length)
            for (var i = 0; i < Element.Blocked_users.length; i++) {
                blocked.push(Element.Blocked_users[i])

            }
            if (Element.Blocked_By) {
                for (var i = 0; i < Element.Blocked_By.length; i++) {
                    blockedBy.push(Element.Blocked_By[i])
                }
            }
        })

    })
    var blocks = blocked.concat(blockedBy)
    console.log(blocks)
    await UserData.find({ "Username": { $nin: blocks, $ne: req.params.user } }).then((datas) => {

        res.send(datas)
    })
    // }
    UserData.find({ "Username": { $ne: req.params.user } }).then((datas) => {
    })
}
module.exports = {
    registerUser,
    userLogin,
    checkUsername,
    userList
};