const { Event } = require("../Structures")
const moment = require("moment")
const { Constants } = require("../Internals")

module.exports = class channelCreate extends Event {
    constructor(client) {
        super(client, {
            title: `channelCreate`,
            type: `discord`
        })
    }
    async handle(ch) {
        if (ch.guild) {
            const [svr] = [ch.guild];
            this.client.log.debug(`New ${ch.type} channel '${ch.name}' created in ${svr.name}`, {
                svr_id: svr.id,
                ch_id: ch.id
            })
            const serverDocument = await svr.populateDocument()
            if (serverDocument) {
                serverDocument.channels.push({
                    _id: ch.id
                })
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
                            color: this.client.getEmbedColor(svr, Constants.Colors.YELLOW),
                            title: `Channel Created`,
                            description: `A new ${ch.type} channel was created.`,
                            fields: embedFields,
                            footer: {
                                text: `Channel ID: ${ch.id} | ${moment(ch.createdTimestamp).format(serverDocument.config.date_format)}`
                            }
                        }
                    })
                    await serverDocument.save();
                    this.client.log.silly(`Successfully saved server document for '${svr.name}'`, {
                        svr_id: svr.id
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