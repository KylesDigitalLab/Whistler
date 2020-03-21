const { Event } = require("../Structures")

module.exports = class ErrorEvent extends Event {
    constructor(client) {
        super(client, {
            title: `error`,
            type: `discord`
        })
    }
    async handle(err) {
        this.client.log.error(err)
    }
}
