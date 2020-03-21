const { Event } = require("../Structures")

module.exports = class Invalidated extends Event {
    constructor(client) {
        super(client, {
            title: `invalidated`,
            type: `discord`
        })
    }
    async handle() {
        this.client.log.error(`An unknown expection occurred caused the client to be invalidated, and we must terminate the connection. Sorry about that!`)
        this.client.destroy();
    }
}
