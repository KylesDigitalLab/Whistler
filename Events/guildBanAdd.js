const { Event } = require("../Structures")
const moment = require("moment")

module.exports = class guildBanAdd extends Event {
    constructor(bot) {
        super(bot, {
            title: `guildBanAdd`,
            type: `Discord`
        })
    }
    handle = async (db, svr, usr) => {
        this.bot.log.debug(`User ${usr.tag} banned from server '${svr.name}'`, {
            svr_id: svr.id,
            usr_id: usr.id
        })
        const serverData = await db.servers.findOne({
            _id: svr.id
        })
        if(serverData) {
            if(serverData.config.log.enabled) {
                const ch = await this.bot.channels.fetch(serverData.config.log.channel_id)
                await ch.send({
                    embed: {
                        thumbnail: {
                            url: usr.avatarURL()
                        },
                        color: this.bot.getEmbedColor(svr, this.bot.configJS.color_codes.YELLOW),
                        title: `🔨 Member Banned`,
                        description: `**${usr.tag}** has been banned from the server.`,
                        footer: {
                            text: `User ID: ${usr.id} | ${moment(new Date()).format(serverData.config.date_format)}`
                        }
                    }
                })
            }
        } else {
            this.bot.log.error(`Could not find server data for ${svr.name}`, {
                svr_id: svr.name,
                serverData: serverData
            })
        }
    }
}