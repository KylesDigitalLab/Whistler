const { Event } = require("../Structures")

module.exports = class Warn extends Event {
    constructor(client) {
        super(client, {
            title: `warn`,
            type: `discord`
        })
    }
    async handle(info) {
        this.client.log.warn(info)
    }
}