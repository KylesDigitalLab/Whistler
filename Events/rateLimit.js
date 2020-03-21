const { Event } = require("../Structures")

module.exports = class RateLimitEvent extends Event {
    constructor(client) {
        super(client, {
            title: `rateLimit`,
            type: `discord`
        })
    }
    async handle(info) {
        this.client.log.warn(`Rate limit hit:`, info)
    }
}
