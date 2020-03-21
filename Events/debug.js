const { Event } = require("../Structures")

module.exports = class DebugEvent extends Event {
    constructor(client) {
        super(client, {
            title: `debug`,
            type: `discord`
        })
    }
    async handle(info) {
        this.client.log.verbose(info)
    }
}
