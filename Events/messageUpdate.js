const { Event } = require("../Structures")
const moment = require("moment")
const { Constants } = require("../Internals")

module.exports = class messageUpdate extends Event {
    constructor(client) {
        super(client, {
            title: `messageUpdate`,
            type: `discord`
        })
    }
    async handle(oldMsg, msg) {
        const [svr, usr, ch] = [msg.guild, msg.author, msg.channel]
        if (svr) {
            const serverDocument = await svr.populateDocument()
            if (serverDocument) {
                if (serverDocument.config.log.enabled) {
                    const channel = svr.channels.cache.get(serverDocument.config.log.channel_id)
                    if (msg.content !== oldMsg.content) {
                        await channel.send({
                            embed: {
                                thumbnail: {
                                    url: usr.avatarURL()
                                },
                                color: Constants.Colors.WARNING,
                                title: `⚠️ Message Edited:`,
                                description: `**${usr.tag}**'s message in ${ch.toString()} has been edited:`,
                                fields: [
                                    {
                                        name: `Old Content:`,
                                        value: `\`\`\`${oldMsg.content}\`\`\``,
                                        inline: true
                                    },
                                    {
                                        name: `New Content:`,
                                        value: `\`\`\`${msg.content}\`\`\``,
                                        inline: true
                                    },
                                    {
                                        name: `🆔:`,
                                        value: msg.id,
                                        inline: false
                                    }
                                ],
                                footer: {
                                    text: `User ID: ${usr.id} | ${svr.formatDate()}`
                                }
                            }
                        })
                    }
                }
            } else {
                this.client.log.error(`Could not find server document for ${svr.name} for messageUpdate`, {
                    svr_id: svr.name,
                    serverDocument: serverDocument
                })
            }
        }
    }
}