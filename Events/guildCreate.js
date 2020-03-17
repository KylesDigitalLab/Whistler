const setupNewServer = require("./../Modules/setupNewServer.js")
const { Event } = require("../Structures")

module.exports = class guildCreate extends Event {
    constructor(bot) {
        super(bot, {
            title: `guildCreate`,
            type: `Discord`
        })
    }
    run = async (db, svr) => {
        this.bot.log.info(`Joined server '${svr.name}', owned by ${svr.owner.user.tag}, creating server data now...`, {
            svr_id: svr.id,
            usr_id: svr.ownerID
        })
        const serverData = await setupNewServer(this.bot, svr, new db.servers({
            _id: svr.id
        }))
        await db.servers.create(serverData)
        this.bot.log.info(`Created server data for '${svr.name}'\r\n`, {
            svr_id: svr.id
        })
    }
}