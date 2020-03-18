const { Event } = require("../Structures")
const { DiscordAPIError } = require("discord.js")

module.exports = class unhandledRejection extends Event {
    constructor(bot) {
        super(bot, {
            title: `unhandledRejection`,
            type: `Process`
        })
    }
    handle = async err => {
        if(err instanceof DiscordAPIError) {
            this.bot.log.warn(`Discord API Error:\r\n`, err)
        } else {
            this.bot.log.error(`Unhandled Rejection:\r\n`, err)
        }
    }
}