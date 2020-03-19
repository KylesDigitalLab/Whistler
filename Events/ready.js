const setupNewServer = require("./../Modules/setupNewServer")
const WebSocket = require("../Web/WebSocket")
const { Event } = require("../Structures")

module.exports = class Ready extends Event {
    constructor(bot) {
        super(bot, {
            title: `ready`,
            type: `Discord`
        })
    }
    handle = async (db) => {
        this.bot.log.info(`Successfully connected to Discord as ${this.bot.user.tag}, in ${this.bot.guilds.cache.size} server${this.bot.guilds.cache.size == 1 ? "" : "s"} with ${this.bot.users.cache.size} user${this.bot.users.cache.size == 1 ? "" : "s"}\r\n`, {
            id: this.bot.user.id
        })
        this.bot.guilds.cache.forEach(async svr => {
            try {
                await svr.populateDocument()
                const serverDocument = svr.serverDocument;
                if (serverDocument) {
                    this.bot.log.verbose(`Server document is OK for ${svr.name}`, {
                        svr_id: svr.id
                    })
                } else {
                    this.bot.log.warn(`Server document not found for ${svr.name}, creating document`, {
                        svr_id: svr.id
                    })
                    try {
                        const serverDocument = await setupNewServer(this.bot, svr, new db.servers({
                            _id: svr.id
                        }))
                        await db.servers.create(serverDocument)
                        this.bot.log.info(`Successfully created server document for ${svr.name}`, {
                            svr_id: svr.id
                        })
                    } catch (err) {
                        this.bot.log.error(`Failed to create server document for ${svr.name}`, {
                            svr_id: svr.id
                        }, err)
                    }
                }
            } catch (err) {
                this.bot.log.error(`Failed to get server document for '${svr.name}'`, {
                    svr_id: svr.id
                }, err)
            }
        })

        try {
            const presenceData = await this.bot.user.setPresence(this.bot.configJS.getPresence(this.bot))
            this.bot.log.verbose(`Successfully set presence data`)
        } catch (err) {
            this.bot.log.error("Failed to set presence", err)
        }
        const web = new WebSocket(this.bot);
        String.prototype.capitalize = str => str.toString().replace(/^\w/, s => s.toUpperCase())
    }
}
