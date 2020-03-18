const config = require('./../../config/config.json')
const configJS = require('./../../config/config.js')
const { Schema } = require("mongoose")

module.exports = new Schema({
    _id: {
        type: String,
        required: true
    },
    config: {
        prefix: {
            type: String,
            default: config.default_prefix,
            maxlength: 10,
            minlength: 1
        },
        units: {
            temperature: {
                type: String,
                default: configJS.server_defaults.temperature_unit
            }
        },
        date_format: {
            type: String,
            default: `MMMM Do, YYYY, h:mm:ss a`
        },
        commands: {
            delete_cmd_msg: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Array
            }
        },
        moderation: {
            log: {
                enabled: {
                    type: Boolean,
                    default: false
                },
                channel_id: {
                    type: String
                }
            }
        },
        log: {
            enabled: {
                type: Boolean,
                default: false
            },
            channel_id: {
                type: String
            }
        }
    },
    members: [new Schema({
        _id: {
            type: String,
            required: true
        },
        message_count: {
            type: Number,
            default: 0
        },
        last_active: Date,
        strikes: [new Schema({
            _id: {
                type: String,
                required: true
            },
            reason: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        })]
    })],
    roles: [new Schema({
        _id: {
            type: String,
            required: true
        },
    })],
    channels: [new Schema({
        _id: {
            type: String,
            required: true
        },
        bot_enabled: {
            type: Boolean,
            default: true
        }
    })],
    messages_today: {
        type: Number,
        default: 0
    }
})