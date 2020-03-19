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
        await svr.populateDocument()
        const serverDocument = svr.serverDocument;
        if (serverDocument) {
            if (serverDocument.config.log.enabled) {
                const ch = await this.bot.channels.fetch(serverDocument.config.log.channel_id)
                await ch.send({
                    embed: {
                        thumbnail: {
                            url: usr.avatarURL()
                        },
                        color: this.bot.getEmbedColor(svr, this.bot.configJS.color_codes.YELLOW),
                        title: `🔨 Member Banned`,
                        description: `**${usr.tag}** has been banned from the server.`,
                        footer: {
                            text: `User ID: ${usr.id} | ${moment(new Date()).format(serverDocument.config.date_format)}`
                        }
                    }
                })
            }
        } else {
            this.bot.log.error(`Could not find server document for ${svr.name}`, {
                svr_id: svr.name,
                serverDocument: serverDocument
            })
        }
    }
}