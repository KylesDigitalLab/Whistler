const { Event } = require("../Structures")
const moment = require("moment")

module.exports = class channelDelete extends Event {
    constructor(bot) {
        super(bot, {
            title: `channelDelete`,
            type: `Discord`
        })
    }
    handle = async (db, ch) => {
        if (ch.guild) {
            const [svr] = [ch.guild];
            this.bot.log.debug(`${ch.type} channel '${ch.name}' deleted in ${svr.name}`, {
                svr_id: svr.id,
                ch_id: ch.id
            })
            await svr.populateDocument()
            const serverDocument = svr.serverDocument;
            if (serverDocument) {
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
                            color: this.bot.configJS.color_codes.YELLOW,
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
                this.bot.log.error(`Could not find server document for ${svr.name}`, {
                    svr_id: svr.name,
                    serverDocument: serverDocument
                })
            }
        }
    }
}