/* eslint-disable global-require */
/* eslint-disable consistent-return */

/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose')
const { Schema } = mongoose

const ModelSchema = Schema({
    userName: { type: String, required: true },
    emailAddress: { type: String, required: true },
    accountNumber: { type: String, required: true },
    identityNumber: { type: Number, required: true },
    deleted: { type: Boolean, default: false },
}, {
    timestamps: true,
})

ModelSchema.pre([
    'find',
    'findOne',
    'countDocuments',
], function () {
    const { withDeleted } = this.options
    if (!withDeleted) {
        this.where({ deleted: false })
    }
})
module.exports = mongoose.model('User', ModelSchema)
