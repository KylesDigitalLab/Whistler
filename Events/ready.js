const setupNewServer = require("./../Modules/setupNewServer")
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
                const serverData = await db.servers.findOne({
                    _id: svr.id
                })
                if (serverData) {
                    this.bot.log.debug(`Database entry OK for ${svr.name}\r\n`, {
                        svr_id: svr.id
                    })
                } else {
                    this.bot.log.warn(`Server data not found for ${svr.name}, creating data...\r\n`, {
                        svr_id: svr.id
                    })
                    try {
                        const serverData = await setupNewServer(this.bot, svr, new db.servers({
                            _id: svr.id
                        }))
                        await db.servers.create(serverData)
                        this.bot.log.info(`Successfully created server data for ${svr.name}\r\n`, {
                            svr_id: svr.id
                        })
                    } catch (err) {
                        this.bot.log.error(`Failed to create server data for ${svr.name}`, {
                            svr_id: svr.id
                        }, err)
                    }
                }
            } catch (err) {
                this.bot.log.error(`Failed to get server data for '${svr.name}'\r\n`, {
                    svr_id: svr.id
                }, err)
            }
        })

        const presence = this.bot.configJS.getPresence(this.bot)
        try {
            const presenceData = await this.bot.user.setPresence(presence)
            this.bot.log.debug(`Set presence data\r\n`, presenceData || ``)
        } catch (err) {
            this.bot.log.error("Failed to set presence", {
                Presence: presence
            }, err)
        }
        String.prototype.capitalize = str => str.toString().replace(/^\w/, s => s.toUpperCase())
    }
}
