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
        const [svr] = [ch.guild];
        this.bot.log.debug(`New ${ch.type} channel '${ch.name}' created in ${svr.name}`, {
            svr_id: svr.id,
            ch_id: ch.id
        })
        const serverData = await db.servers.findOne({
            _id: svr.id
        })
        if (serverData) {
            serverData.channels.push({
                _id: ch.id
            })
            if (serverData.config.log.enabled) {
                const channel = await this.bot.channels.fetch(serverData.config.log.channel_id)
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
                            text: `Channel ID: ${ch.id} | ${moment(ch.createdTimestamp).format(serverData.config.date_format)}`
                        }
                    }
                })
                await serverData.save();
                this.bot.log.silly(`Successfully saved server data for '${svr.name}'`, {
                    svr_id: svr.id
                })
            }
        } else {
            this.bot.log.error(`Could not find server data for ${svr.name}`, {
                svr_id: svr.name,
                serverData: serverData
            })
        }
    }
}