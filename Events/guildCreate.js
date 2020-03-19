const setupNewServer = require("./../Modules/setupNewServer.js")
const { Event } = require("../Structures")

module.exports = class guildCreate extends Event {
    constructor(bot) {
        super(bot, {
            title: `guildCreate`,
            type: `Discord`
        })
    }
    handle = async (db, svr) => {
        this.bot.log.info(`Joined server '${svr.name}', owned by ${svr.owner.user.tag}, creating server document now...`, {
            svr_id: svr.id,
            usr_id: svr.ownerID
        })
        try {
            const serverDocument = await setupNewServer(this.bot, svr, new db.servers({
                _id: svr.id
            }))
            await db.servers.create(serverDocument)
            this.bot.log.info(`Successfully created server document for ${svr.name}\r\n`, {
                svr_id: svr.id
            })
        } catch(err) {
            this.bot.log.info(`Failed to create server document for ${svr.name}\r\n`, {
                svr_id: svr.id
            }, err)
        }
    }
}