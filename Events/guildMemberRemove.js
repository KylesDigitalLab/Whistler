const { Event } = require("../Structures")
const moment = require("moment")

module.exports = class guildMemberRemove extends Event {
    constructor(bot) {
        super(bot, {
            title: `guildMemberRemove`,
            type: `Discord`
        })
    }
    run = async (db, member) => {
        const [svr, usr] = [member.guild, member.user];
        this.bot.log.debug(`User ${usr.tag} left or was kicked from server '${svr.name}'`, {
            svr_id: svr.id,
            usr_id: usr.id
        })
        const serverData = await db.servers.findOne({
            _id: svr.id
        })
        if(serverData.config.log.isEnabled) {
            const ch = await this.bot.channels.fetch(serverData.config.log.channel_id)
            await ch.send({
                embed: {
                    thumbnail: {
                        url: usr.avatarURL()
                    },
                    color: this.bot.getEmbedColor(svr, this.bot.configJS.color_codes.YELLOW),
                    title: `👤 Member Left`,
                    description: `**${usr.tag}** has left or been kicked from the server.`,
                    footer: {
                        text: `User ID: ${usr.id} | ${moment(new Date()).format(serverData.config.date_format)}`
                    }
                }
            })
        }
    }
}