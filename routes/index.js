const express = require('express')
const router = express.Router()
const { ensureToken } = require('../utils')
const UserController = require('../controllers/userController')

module.exports = function routes(app) {
    app.use('/api', router)
    router.post('/signup', UserController.register)
    router.get('/user/:id', ensureToken, UserController.getOne)
    router.get('/user', ensureToken, UserController.getAll)
    router.put('/user/:id', ensureToken, UserController.update)
    router.delete('/user/:id', ensureToken, UserController.delete)
}