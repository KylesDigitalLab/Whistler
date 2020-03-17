const { Event } = require("../Structures")
const moment = require("moment")

module.exports = class guildMemberAdd extends Event {
    constructor(bot) {
        super(bot, {
            title: `guildMemberAdd`,
            type: `Discord`
        })
    }
    run = async (db, member) => {
        const [svr, usr] = [member.guild, member.user];
        this.bot.log.debug(`User ${usr.tag} joined server ${svr.name}`, {
            svr_id: svr.id,
            usr_id: usr.id
        })
        const serverData = await db.servers.findOne({
            _id: svr.id
        })
        serverData.members.push({
            _id: usr.id
        })
        if(serverData.config.log.isEnabled) {
            const ch = await this.bot.channels.fetch(serverData.config.log.channel_id)
            await ch.send({
                embed: {
                    thumbnail: {
                        url: usr.avatarURL()
                    },
                    color: this.bot.getEmbedColor(svr, this.bot.configJS.color_codes.YELLOW),
                    title: `👤 Member Joined`,
                    description: `**${usr.tag}** has joined the server.`,
                    footer: {
                        text: `User ID: ${usr.id} | ${moment(member.joinedTimestamp).format(serverData.config.date_format)}`
                    }
                }
            })
        }
        await serverData.save();
        this.bot.log.silly(`Successfully saved server data for '${svr.name}'`, {
            svr_id: svr.id,
            usr_id: usr.id
        })
    }
}