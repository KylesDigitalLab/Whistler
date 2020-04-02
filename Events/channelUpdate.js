const { Event } = require("../Structures")
const moment = require("moment")
const { Constants } = require("../Internals")

module.exports = class channelUpdate extends Event {
    constructor(client) {
        super(client, {
            title: `channelUpdate`,
            type: `discord`
        })
    }
    async handle(oldCh, ch) {
        if (ch.guild) {
            const [svr] = [ch.guild];
            if (svr) {
                const serverDocument = await svr.populateDocument()
                if (serverDocument) {
                    if (serverDocument.config.log.enabled) {
                        const channel = svr.channels.cache.get(serverDocument.config.log.channel_id)
                        if (ch.name !== oldCh.name) {
                            await channel.send({
                                embed: {
                                    color: this.client.getEmbedColor(svr),
                                    title: `#️⃣  Channel Updated:`,
                                    description: `A ${ch.type} channel's name was changed:`,
                                    fields: [
                                        {
                                            name: `Old Name:`,
                                            value: `\`${oldCh.name}\``,
                                            inline: true
                                        }, 
                                        {
                                            name: `New Name:`,
                                            value: `\`${ch.name}\``,
                                            inline: true
                                        }
                                    ],
                                    footer: {
                                        text: `Channel ID: ${ch.id} | ${svr.formatDate()}`
                                    }
                                }
                            })
                        }
                        if (ch.topic !== oldCh.topic) {
                            await channel.send({
                                embed: {
                                    color: this.client.getEmbedColor(svr),
                                    title: `#️⃣  Channel Updated:`,
                                    description: `${ch.toString()}'s topic was changed:`,
                                    fields: [
                                        {
                                            name: `Old Topic:`,
                                            value: `\`\`\`${oldCh.topic}\`\`\``,
                                            inline: false
                                        },
                                        {
                                            name: `New Topic:`,
                                            value: `\`\`\`${ch.topic}\`\`\``,
                                            inline: false
                                        }
                                    ],
                                    footer: {
                                        text: `Channel ID: ${ch.id} | ${svr.formatDate()}`
                                    }
                                }
                            })
                        }
                    }
                } else {
                    this.client.log.error(`Could not find server document for ${svr.name}`, {
                        svr_id: svr.name,
                        serverDocument: serverDocument
                    })
                }
            }
        }
    }
}