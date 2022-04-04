/* eslint-disable no-else-return */
const jwt = require('jsonwebtoken')
const { User } = require('../models')

const EnsureToken = async (req, res, next) => {
    const token = req.headers.Authorization
        || req.headers.authorization
        || req.query.token

    const checkUser = async (userId) => {
        const user = await User.findOne({
            _id: userId,
            deleted: { $in: [true, false] },
        })

        // handle only new token authorized
        if (!user) {
            return res.status(401).json({ message: 'Akun anda telah dihapus atau di non-aktifkan' })
        }
        if (user.deleted) {
            return res.status(401).json({ message: 'Akun anda telah dihapus atau di non-aktifkan' })
        }
        return JSON.parse(JSON.stringify(user))
    }

    // decode token
    if (token && token.length !== 32) {
        // verifies secret and checks exp
        jwt.verify(token, "secret", async (err, decoded) => {
            if (err) {
                console.log(err)
                return res.status(401).json({ message: 'Silahkan untuk login ulang' })
            }
            else {
                await checkUser(decoded.user._id)

                // handle expire
                if (decoded.exp <= Date.now() / 1000) {
                    return res.status(401).send({
                        message: 'Silahkan login ulang',
                        date: Date.now() / 1000,
                        exp: decoded.exp,
                    })
                }
                // if everything is good, save to request for use in other routes
                req.headers.tokenDecoded = decoded
                return next()
            }
        })
    }
    else {
        // if there is no token
        // return an error
        return res.status(401).send({ message: 'No token provided.' })
    }
}

module.exports = EnsureToken
