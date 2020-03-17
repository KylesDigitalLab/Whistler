const { Event } = require("../Structures")
const moment = require("moment")

module.exports = class channelDelete extends Event {
    constructor(bot) {
        super(bot, {
            title: `channelDelete`,
            type: `Discord`
        })
    }
    run = async (db, ch) => {
        const [svr] = [ch.guild];
        this.bot.log.debug(`${ch.type} channel '${ch.name}' deleted in ${svr.name}`, {
            svr_id: svr.id,
            ch_id: ch.id
        })
        const serverData = await db.servers.findOne({
            _id: svr.id
        })
        serverData.channels.push({
            _id: ch.id
        })
        if(serverData.config.log.isEnabled) {
            const channel = await this.bot.channels.fetch(serverData.config.log.channel_id)
            const embedFields = [];
            if(channel.name) {
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
                        text: `Channel ID: ${ch.id} | ${moment(new Date()).format(serverData.config.date_format)}`
                    }
                }
            })
        }
        await serverData.save();
        this.bot.log.silly(`Successfully saved server data for '${svr.name}'`, {
            svr_id: svr.id
        })
    }
}