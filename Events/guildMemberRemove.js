const { Event } = require("../Structures")
const moment = require("moment")
const { Constants } = require("../Internals")

module.exports = class guildMemberRemove extends Event {
    constructor(client) {
        super(client, {
            title: `guildMemberRemove`,
            type: `discord`
        })
    }
    async handle(member) {
        const [svr, usr] = [member.guild, member.user];
        this.client.log.debug(`User ${usr.tag} left or was kicked from server '${svr.name}'`, {
            svr_id: svr.id,
            usr_id: usr.id
        })
        const serverDocument = await svr.populateDocument()
        if (serverDocument) {
            if (serverDocument.config.log.enabled) {
                const ch = svr.channels.cache.get(serverDocument.config.log.channel_id)
                await ch.send({
                    embed: {
                        thumbnail: {
                            url: usr.avatarURL(Constants.ImageURLOptions)
                        },
                        color: this.client.getEmbedColor(svr, Constants.Colors.WARNING),
                        title: `👤 Member Left`,
                        description: `**${usr.tag}** has left or been kicked from the server.`,
                        footer: {
                            text: `User ID: ${usr.id} | ${svr.formatDate()}`
                        }
                    }
                })
            }
        } else {
            this.client.log.error(`Could not find server document for ${svr.name}`, {
                svr_id: svr.name,
                serverDocument: serverDocument
            })
        }
    }
}