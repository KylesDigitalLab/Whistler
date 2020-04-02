const { NewServer } = require("../Modules")
const WebSocket = require("../Web/WebSocket")
const { Event } = require("../Structures")

module.exports = class Ready extends Event {
    constructor(client) {
        super(client, {
            title: `ready`,
            type: `discord`
        })
    }
    async handle() {
        this.client.log.info(`Successfully connected to Discord as ${this.client.user.tag}, in ${this.client.guilds.cache.size} server${this.client.guilds.cache.size == 1 ? "" : "s"} with ${this.client.users.cache.size} user${this.client.users.cache.size == 1 ? "" : "s"}\r\n`, {
            id: this.client.user.id
        })
        this.client.guilds.cache.forEach(async svr => {
            try {
                const serverDocument = await svr.populateDocument()
                if (serverDocument) {
                    this.client.log.verbose(`Server document is OK for ${svr.name}`, {
                        svr_id: svr.id
                    })
                } else {
                    this.client.log.warn(`Server document not found for ${svr.name}, creating document`, {
                        svr_id: svr.id
                    })
                    try {
                        const serverDocument = await NewServer(this.client, svr, new this.client.db.servers({
                            _id: svr.id
                        }))
                        await this.client.db.servers.create(serverDocument)
                        this.client.log.info(`Successfully created server document for ${svr.name}`, {
                            svr_id: svr.id
                        })
                    } catch (err) {
                        this.client.log.error(`Failed to create server document for ${svr.name}`, {
                            svr_id: svr.id
                        }, err)
                    }
                }
            } catch (err) {
                this.client.log.error(`Failed to get server document for '${svr.name}'`, {
                    svr_id: svr.id
                }, err)
            }
        })
        await this.client.user.setPresence(this.client.configJS.getPresence(this.client))

        const web = new WebSocket(this.client);
    }
}
