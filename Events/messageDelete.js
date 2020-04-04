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
        this.client.log.silly(`Message by ${usr.tag} deleted in channel #${ch.name} in ${svr ? svr.name : "DM"}`, {
            svr_id: svr ? svr.id : "DM",
            usr_id: usr.id,
            msg_id: msg.id,
            msg_content: msg.content
        })
        if (svr) {
            const serverDocument = await svr.populateDocument()
            if (serverDocument) {
                if (serverDocument.config.log.enabled) {
                    const channel = svr.channels.cache.get(serverDocument.config.log.channel_id)
                    await channel.send({
                        embed: {
                            thumbnail: {
                                url: usr.avatarURL()
                            },
                            color: Constants.Colors.WARNING,
                            title: `⚠️ Message Deleted:`,
                            description: `**${usr.tag}**'s message in ${ch.toString()} has been deleted:\`\`\`${msg.content || "No Content"}\`\`\``,
                            fields: [
                                {
                                    name: `🆔:`,
                                    value: msg.id,
                                    inline: true
                                },
                                {
                                    name: `📨 Sent:`,
                                    value: svr.formatDate(msg.createdAt),
                                    inline: true
                                }
                            ],
                            footer: {
                                text: `User ID: ${usr.id} | ${svr.formatDate()}`
                            }
                        }
                    })
                }
            } else {
                this.client.log.error(`Could not find server document for ${svr.name} for messageDelete`, {
                    svr_id: svr.name,
                    serverDocument: serverDocument
                })
            }
        }
    }
}