const { Event } = require("../Structures")

module.exports = class guildUnavailable extends Event {
    constructor(client) {
        super(client, {
            title: `guildUnavailable`,
            type: `discord`
        })
    }
    async handle(svr) {
        this.client.log.warn(`Server ${svr.name} became unavailable, there might be an outage`, {
            svr_id: svr.id
        })
    }
}