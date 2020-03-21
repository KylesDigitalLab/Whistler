const { Event } = require("../Structures")

module.exports = class uncaughtException extends Event {
    constructor(client) {
        super(client, {
            title: `uncaughtException`,
            type: `process`
        })
    }
    async handle(err) {
        this.client.log.error(`Uncaught Exception:`, err)
    }
}
