const { Event } = require("../Structures")
const moment = require("moment")

module.exports = class channelCreate extends Event {
    constructor(bot) {
        super(bot, {
            title: `channelCreate`,
            type: `Discord`
        })
    }
    handle = async (db, ch) => {
        if (ch.guild) {
            const [svr] = [ch.guild];
            this.bot.log.debug(`New ${ch.type} channel '${ch.name}' created in ${svr.name}`, {
                svr_id: svr.id,
                ch_id: ch.id
            })
            await svr.populateDocument()
            const serverDocument = svr.serverDocument;
            if (serverDocument) {
                serverDocument.channels.push({
                    _id: ch.id
                })
                if (serverDocument.config.log.enabled) {
                    const channel = await this.bot.channels.fetch(serverDocument.config.log.channel_id)
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
                            color: this.bot.getEmbedColor(svr, this.bot.configJS.color_codes.YELLOW),
                            title: `Channel Created`,
                            description: `A new ${ch.type} channel was created.`,
                            fields: embedFields,
                            footer: {
                                text: `Channel ID: ${ch.id} | ${moment(ch.createdTimestamp).format(serverDocument.config.date_format)}`
                            }
                        }
                    })
                    await serverDocument.save();
                    this.bot.log.silly(`Successfully saved server document for '${svr.name}'`, {
                        svr_id: svr.id
                    })
                }
            } else {
                this.bot.log.error(`Could not find server document for ${svr.name}`, {
                    svr_id: svr.name,
                    serverDocument: serverDocument
                })
            }
        }
    }
}