const { FindOrCreateSchema } = require("./../../Structures")
const { configJS } = require('./../../config')

module.exports = new FindOrCreateSchema({
    _id: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        required: false
    }, 
    last_active: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String
    },
    timezone: {
        type: String,
        default: null,
    },
    profiles: {
        github: {
            type: String,
            required: false
        },
        twitter: {
            type: String,
            required: false
        },
        instagram: {
            type: String,
            required: false
        },
        reddit: {
            type: String,
            required: false
        },
        youtube: {
            type: String,
            required: false
        },
        twitch: {
            type: String,
            required: false
        }
    }
})