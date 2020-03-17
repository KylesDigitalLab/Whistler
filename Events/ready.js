const setupNewServer = require("./../Modules/setupNewServer")
const { Event } = require("../Structures")

module.exports = class Ready extends Event {
    constructor(bot) {
        super(bot, {
            title: `ready`,
            type: `Discord`
        })
    }
    run = async (db) => {
        this.bot.log.info(`Successfully connected to Discord as ${this.bot.user.tag}\r\n`, {
            bot_id: this.bot.user.id,
            server_count: this.bot.guilds.cache.size
        })
        this.bot.guilds.cache.forEach(async svr => {
            const serverData = await db.servers.findOne({
                _id: svr.id
            }).catch(err => {
                this.bot.log.error(`Failed to get server data for '${svr.name}'\r\n`, {
                    svr_id: svr.id
                }, err)
            })
            if (serverData) {
                this.bot.log.debug(`Database entry OK for '${svr.name}'\r\n`, {
                    svr_id: svr.id
                })
            } else {
                this.bot.log.info(`Server data not found for '${svr.name}', creating data...\r\n`, {
                    svr_id: svr.id
                })
                const serverData = await setupNewServer(this.bot, svr, new db.servers({
                    _id: svr.id
                })).catch(err => {
                    this.bot.log.error(`Failed to create server data for '${svr.name}'\r\n`, {
                        svr_id: svr.id
                    }, err)
                })
                await db.servers.create(serverData).catch(err => {
                    this.bot.log.error(`Failed to create server data for '${svr.name}'\r\n`, {
                        svr_id: svr.id
                    }, err)
                })
                this.bot.log.info(`Created server data for '${svr.name}'\r\n`, {
                    svr_id: svr.id
                })
            }
        })

        const Presence = this.bot.configJS.getPresence(this.bot)
        const presenceData = await this.bot.user.setPresence(Presence).catch(err => this.bot.log.error("Failed to set presence", {
                Presence: Presence,
                error: err
            }))
        this.bot.log.debug(`Set presence data\r\n`, presenceData || ``)
        String.prototype.capitalize = str => str.toString().replace(/^\w/, s => s.toUpperCase())
    }
}
