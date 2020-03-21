const { Event } = require("../Structures")
const { DiscordAPIError } = require("discord.js")

module.exports = class unhandledRejection extends Event {
    constructor(client) {
        super(client, {
            title: `unhandledRejection`,
            type: `process`
        })
    }
    async handle (err) {
        if(err instanceof DiscordAPIError) {
            this.client.log.warn(`Discord API Error:`, err)
        } else {
            this.client.log.warn(`Unhandled Rejection:`, err)
        }
    }
}