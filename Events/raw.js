const { Event } = require("../Structures")

module.exports = class Raw extends Event {
    constructor(client) {
        super(client, {
            title: `raw`,
            type: `discord`
        })
    }
    async handle(packet) {
        this.client.log.silly(`Received event ${packet.t} from Discord`)
    }
}