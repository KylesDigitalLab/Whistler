const { Event } = require("../Structures")
const moment = require("moment")
const { Constants } = require("../Internals")

module.exports = class guildMemberAdd extends Event {
    constructor(client) {
        super(client, {
            title: `guildMemberAdd`,
            type: `discord`
        })
    }
    async handle(member) {
        const [svr, usr] = [member.guild, member.user];
        this.client.log.debug(`User ${usr.tag} joined server ${svr.name}`, {
            svr_id: svr.id,
            usr_id: member.id
        })
        const serverDocument = await svr.populateDocument()
        if (serverDocument) {
            serverDocument.members.push({
                _id: member.id
            })
            const memberDocument = serverDocument.members.id(member.id)
            if (serverDocument.config.log.enabled) {
                const ch = await this.client.channels.fetch(serverDocument.config.log.channel_id)
                await ch.send({
                    embed: {
                        thumbnail: {
                            url: usr.avatarURL()
                        },
                        color: this.client.getEmbedColor(svr, Constants.Colors.YELLOW),
                        title: `👤 Member Joined`,
                        description: `**${usr.tag}** has joined the server.`,
                        footer: {
                            text: `User ID: ${member.id} | ${moment(member.joinedTimestamp).format(serverDocument.config.date_format)}`
                        }
                    }
                })
            }
            await serverDocument.save();
            this.client.log.silly(`Successfully saved server document for ${svr.name}`, {
                svr_id: svr.id,
                usr_id: member.id
            })
        } else {
            this.client.log.error(`Could not find server document for ${svr.name}`, {
                svr_id: svr.id,
                serverDocument: serverDocument
            })
        }
    }
}