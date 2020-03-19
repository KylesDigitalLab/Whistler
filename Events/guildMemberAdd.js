const { Event } = require("../Structures")
const moment = require("moment")

module.exports = class guildMemberAdd extends Event {
    constructor(bot) {
        super(bot, {
            title: `guildMemberAdd`,
            type: `Discord`
        })
    }
    handle = async (db, member) => {
        const [svr, usr] = [member.guild, member.user];
        this.bot.log.debug(`User ${usr.tag} joined server ${svr.name}`, {
            svr_id: svr.id,
            usr_id: usr.id
        })
        await svr.populateDocument()
        const serverDocument = svr.serverDocument;
        if (serverDocument) {
            serverDocument.members.push({
                _id: usr.id
            })
            if (serverDocument.config.log.enabled) {
                const ch = await this.bot.channels.fetch(serverDocument.config.log.channel_id)
                await ch.send({
                    embed: {
                        thumbnail: {
                            url: usr.avatarURL()
                        },
                        color: this.bot.getEmbedColor(svr, this.bot.configJS.color_codes.YELLOW),
                        title: `👤 Member Joined`,
                        description: `**${usr.tag}** has joined the server.`,
                        footer: {
                            text: `User ID: ${usr.id} | ${moment(member.joinedTimestamp).format(serverDocument.config.date_format)}`
                        }
                    }
                })
            }
            await serverDocument.save();
            this.bot.log.silly(`Successfully saved server document for '${svr.name}'`, {
                svr_id: svr.id,
                usr_id: usr.id
            })
        } else {
            this.bot.log.error(`Could not find server document for ${svr.name}`, {
                svr_id: svr.name,
                serverDocument: serverDocument
            })
        }
    }
}