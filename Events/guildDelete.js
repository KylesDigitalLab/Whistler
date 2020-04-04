const { Event } = require("../Structures")

module.exports = class guildDelete extends Event {
    constructor(client) {
        super(client, {
            title: `guildDelete`,
            type: `discord`
        })
    }
    async handle(svr) {
        this.client.log.info(`Left or was kicked from server ${svr.name}, owned by ${svr.owner.user.tag}`, {
            svr_id: svr.id,
            usr_id: svr.ownerID
        })
        await this.client.db.servers.deleteOne({
            _id: svr.id
        }).catch(err => {
            this.client.log.error(`Failed to remove server document for ${svr.name}`, {
                svr_id: svr.id,
                usr_id: svr.ownerID
            }, err)
        })
    }
}