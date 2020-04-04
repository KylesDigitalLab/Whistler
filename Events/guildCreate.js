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
        if(this.client.config.server_blacklist.includes(svr.id)) {
            await svr.leave()
            this.client.log.info(`Joined and left blacklisted server ${svr.name}, owned by ${svr.owner.user.tag}`, {
                svr_id: svr.id,
                usr_id: svr.ownerID
            })
            return;
        }
        this.client.log.info(`Joined server ${svr.name}, owned by ${svr.owner.user.tag}, creating server document now`, {
            svr_id: svr.id,
            usr_id: svr.ownerID
        })
        try {
            const serverDocument = await NewServer(this.client, svr, new this.client.db.servers({
                _id: svr.id
            }))
            await this.client.db.servers.create(serverDocument)
        } catch (err) {
            this.client.log.error(`Failed to create server document for ${svr.name}`, {
                svr_id: svr.id,
                usr_id: svr.ownerID
            }, err)
        }
        await svr.owner.send({
            embed: {
                title: `🎉 Thank You!`,
                description: `I'm **${this.client.user.username}**, and I've just been added to **${svr.name}**, a server that you own! Thanks for choosing me!`
            }
        }).catch(() => null)
    }
}