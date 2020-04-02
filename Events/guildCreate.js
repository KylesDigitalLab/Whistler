const { NewServer } = require("./../Modules")
const { Event } = require("../Structures")

module.exports = class guildCreate extends Event {
    constructor(client) {
        super(client, {
            title: `guildCreate`,
            type: `discord`
        })
    }
    async handle(svr) {
        this.client.log.info(`Joined server '${svr.name}', owned by ${svr.owner.user.tag}, creating server document now`, {
            svr_id: svr.id,
            usr_id: svr.ownerID
        })
        try {
            const serverDocument = await NewServer(this.client, svr, new this.client.db.servers({
                _id: svr.id
            }))
            await this.client.db.servers.create(serverDocument)
            this.client.log.info(`Successfully created server document for ${svr.name}`, {
                svr_id: svr.id,
                usr_id: svr.ownerID
            })
        } catch (err) {
            this.client.log.error(`Failed to create server document for ${svr.name}`, {
                svr_id: svr.id,
                usr_id: svr.ownerID
            }, err)
        }
        await svr.owner.send({
            embed: {
                title: `🎉 Thank You!`,
                description: `I'm **${this.client.user.username}**, and I've just been added to **${svr.name}**, a server that you own!\nThanks for choosing me!`
            }
        }).catch(() => null)
    }
}