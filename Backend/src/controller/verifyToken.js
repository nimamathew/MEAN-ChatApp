const jwt = require('jsonwebtoken');

const verifyToken=function verifyToken(req, res, next) {
    if (!req.headers.authorization) {
      return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1]
    let isAdmin = req.headers.authorization.split(' ')[2]
    if (token === 'null') {
      return res.status(401).send('Unauthorized request')
    }
    let payload = jwt.verify(token, 'secretKey')
    let payload1 = jwt.verify(isAdmin, 'adminKey')
    if (!payload1) {
      return res.status(401).send('Unauthorized request')
    }
    req.userId = payload.subject
    next()
  }
  
  const verifyUserToken=function verifyUserToken(req, res, next) {
    if (!req.headers.authorization) {
      return res.status(401).send('Unauthorized request')
    }
    let token = req.headers.authorization.split(' ')[1]
    if (token === 'null') {
      return res.status(401).send('Unauthorized request')
    }
    let payload = jwt.verify(token, 'secretKey')
  
    if (!payload) {
      return res.status(401).send('Unauthorized request')
    }
    req.userId = payload.subject
    next()
  }

  module.exports =  {
    verifyUserToken,
    verifyToken
};