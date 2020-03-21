const { Event } = require("../Structures")
const moment = require("moment")
const { Constants } = require("../Internals")

module.exports = class messageDelete extends Event {
    constructor(client) {
        super(client, {
            title: `messageDelete`,
            type: `discord`
        })
    }
    async handle(msg) {
        const [svr, usr, ch] = [msg.guild, msg.author, msg.channel]
        this.client.log.silly(`Message by ${usr.tag} deleted in channel #${ch.name} in ${svr.name}`, {
            svr_id: svr.id,
            usr_id: usr.id,
            msg_id: msg.id,
            msg_content: msg.content
        })
        const serverDocument = await svr.populateDocument()
        if (serverDocument) {
            if (serverDocument.config.log.enabled) {
                const channel = await this.client.channels.fetch(serverDocument.config.log.channel_id)
                await channel.send({
                    embed: {
                        thumbnail: {
                            url: usr.avatarURL()
                        },
                        color: Constants.Colors.WARNING,
                        title: `⚠️ Message Deleted:`,
                        description: `**${usr.tag}**'s message has been deleted:`,
                        fields: [
                            {
                                name: `✉️ Content:`,
                                value: msg.content || `\`No Content\``,
                                inline: true
                            },
                            {
                                name: `🆔:`,
                                value: msg.id,
                                inline: true
                            },
                            {
                                name: `📨 Sent:`,
                                value: moment(msg.createdTimestamp).format(serverDocument.config.date_format),
                                inline: true
                            }
                        ],
                        footer: {
                            text: `User ID: ${usr.id} | ${moment(new Date()).format(serverDocument.config.date_format)}`
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