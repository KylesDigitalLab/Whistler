const { Event } = require("../Structures")
const moment = require("moment")
const { Constants } = require("../Internals")

module.exports = class channelDelete extends Event {
    constructor(client) {
        super(client, {
            title: `channelDelete`,
            type: `discord`
        })
    }
    async handle(ch) {
        if (ch.guild) {
            const [svr] = [ch.guild];
            this.client.log.debug(`${ch.type} channel '${ch.name}' deleted in ${svr.name}`, {
                svr_id: svr.id,
                ch_id: ch.id
            })
            const serverDocument = await svr.populateDocument()
            if (serverDocument) {
                if (serverDocument.config.log.enabled) {
                    const channel = await this.client.channels.fetch(serverDocument.config.log.channel_id)
                    const embedFields = [];
                    if (channel.name) {
                        embedFields.push({
                            name: `Name:`,
                            value: ch.name,
                            inline: true
                        })
                    }
                    await channel.send({
                        embed: {
                            color: Constants.Colors.WARNING,
                            title: `⚠️ Channel Deleted`,
                            description: `A ${ch.type} channel was deleted.`,
                            fields: embedFields,
                            footer: {
                                text: `Channel ID: ${ch.id} | ${moment(new Date()).format(serverDocument.config.date_format)}`
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
}