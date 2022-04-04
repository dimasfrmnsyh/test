const {
    User
} = require('../models')
const moment = require('moment')
const { getRandomCode, client } = require('../utils')
const jwt = require('jsonwebtoken')
const counterAccountNumber = async () => {
    const a = moment().format('YYYY-MM-DD 00:00:00')
    const b = moment().format('YYYY-MM-DD 23:59:59')

    const amount = await User.countDocuments({
        createdAt: {
            $gte: a,
            $lte: b,
        },
    })
    const date = moment().format('YYMMDD')
    const randomNumber = getRandomCode(2, 'number')
    let counter = (amount + 1).toString()

    const digitCounter = 5
    for (let i = 0; i <= (digitCounter - counter.length); i += 1) {
        counter = `0${counter}`
    }

    let accountNumber = `ACC${date}${randomNumber}${counter}`

    const isExist = await User.findOne({ accountNumber })

    if (isExist) {
        accountNumber = await counteraccountNumber()
    }

    return accountNumber
}
const counterIdentityNumber = async () => {

    let identityNumber = getRandomCode(11, 'number')
    const isExist = await User.findOne({ identityNumber })

    if (isExist) {
        identityNumber = await counterIdentityNumber()
    }

    return identityNumber
}
exports.register = async (req, res) => {
    try {
        const {
            userName,
            emailAddress
        } = req.body
        const isExistUsername = await User.findOne({ userName })
        if (isExistUsername) {
            return res.status(400).json({ message: 'Username sudah digunakan' })
        }
        const isExistEmail = await User.findOne({ emailAddress })
        if (isExistEmail) {
            return res.status(400).json({ message: 'Email sudah digunakan' })
        }
        let accountNumber = await counterAccountNumber()
        console.log(accountNumber)
        let identityNumber = await counterIdentityNumber()
        console.log(identityNumber)

        const payload = {
            userName,
            emailAddress,
            accountNumber,
            identityNumber
        }
        const user = new User(payload)
        user.save()
        const userObj = { ...user._doc }
        const token = jwt.sign({ user: userObj }, "secret", { expiresIn: '30d' })

        const dataUser = await User.find()
        await client.setex(`dataUser`, 100, JSON.stringify(dataUser));

        return res.status(200).json({
            message: 'success',
            user: {
                ...userObj,
            },
            token,
        })
    } catch (err) {
        return res.status(400).json({ message: err.message })

    }
}
exports.getOne = async (req, res) => {
    try {
        const {
            id
        } = req.params
        const { user } = req.headers.tokenDecoded
        const dataUser = await User.findOne({ _id: id })

        return res.status(200).json({
            message: 'success',
            data: dataUser
        })
    } catch (err) {
        return res.status(400).json({ message: err.message })

    }
}

exports.getAll = async (req, res) => {
    try {
        const { user } = req.headers.tokenDecoded
        let dataUser
        await client.get(`dataUser`, async (err, data) => {
            if (data) {
                return res.status(200).send({
                    message: 'success',
                    data: JSON.parse(data)
                });
            } else {
                dataUser = await User.find({})
            }
        })
        return res.status(200).json({
            message: 'success',
            data: dataUser,
        })
    } catch (err) {
        return res.status(400).json({ message: err.message })

    }
}
exports.update = async function (req, res) {
    const { id } = req.params
    const { user } = req.headers.tokenDecoded
    const {
        userName, emailAddress
    } = req.body

    try {
        let userData = await User.findOne({ _id: id, deleted: false })

        if (userName != user.userName) {
            const isExistUsername = await User.findOne({ username: userName })
            if (isExistUsername) {
                return res.status(400).json({ message: 'Username sudah digunakan' })
            }
        }
        if (emailAddress != user.emailAddress) {
            const isExistEmail = await User.findOne({ emailAddress: emailAddress })
            if (isExistEmail) {
                return res.status(400).json({ message: 'Email sudah digunakan' })
            }
        }
        let formData = {
            userName,
            emailAddress,
        }
        userDataUpdated = await Object.assign(userData, formData).save()
        const dataUser = await User.find()
        await client.setex(`dataUser`, 100, JSON.stringify(dataUser));
    }
    catch (err) {
        return res.status(400).json({ message: err.message })
    }
    return res.status(200).json({ message: 'success', data: userDataUpdated })
}


exports.delete = async (req, res) => {
    try {
        const { id } = req.params
        const { user } = req.headers.tokenDecoded

        const userData = await User.findOne({ _id: id, deleted: false })
        await Object.assign(userData, { deleted: true }).save()
        const dataUser = await User.find()
        await client.setex(`dataUser`, 100, JSON.stringify(dataUser));
        return res.status(200).json({ message: 'Success' })
    }
    catch (err) {
        return res.status(400).json({ message: err.message })
    }
}