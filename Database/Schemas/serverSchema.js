const { config, configJS } = require('../../config')
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
            default: configJS.date_format
        },
        timezone: {
            type: String,
            default: configJS.server_defaults.timezone,
        },
        commands: {
            delete_messages: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Array,
                default: []
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
                },
                current_case: {
                    type: Number,
                    default: 0
                },
                cases: [new Schema({
                    _id: {
                        type: Number,
                        required: true
                    },
                    timestamp: {
                        type: Date,
                        default: Date.now
                    },
                    action: {
                        type: String,
                        enum: [`Strike`, `Unstrike`, `Kick`, `Ban`, `Mute`, `Unban`, `Unmute`],
                        required: true
                    },
                    user_id: {
                        type: String,
                        required: true
                    },
                    moderator_id: {
                        type: String,
                        required: true
                    },
                    message_id: {
                        type: String,
                        required: true
                    },
                    reason: {
                        type: String
                    }
                })]
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
        blocked: {
            type: Boolean,
            default: false
        },
        message_count: {
            type: Number,
            default: 0
        },
        last_active: Date,
        afk_message: {
            type: String
        },
        strikes: [new Schema({
            admin_id: {
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
        auto_role: {
            type: Boolean,
            default: false
        }
    })],
    channels: {
        text: [new Schema({
            _id: {
                type: String,
                required: true
            },
            bot_enabled: {
                type: Boolean,
                default: true
            }
        })],
        voice: [new Schema({
            _id: {
                type: String,
                required: true
            }
        })],
        category: [new Schema({
            _id: {
                type: String,
                required: true
            }
        })]
    },
    messages_today: {
        type: Number,
        default: 0
    }
})