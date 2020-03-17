const { Event } = require("../Structures")
const moment = require("moment")

module.exports = class messageDelete extends Event {
    constructor(bot) {
        super(bot, {
            title: `messageDelete`,
            type: `Discord`
        })
    }
    run = async (db, msg) => {
        const [svr, usr, ch] = [msg.guild, msg.author, msg.channel]
        this.bot.log.silly(`Message by ${usr.tag} deleted in channel #${ch.name} in ${svr.name}`, {
            svr_id: svr.id,
            usr_id: usr.id,
            msg_id: msg.id,
            msg_content: msg.content
        })
        const serverData = await db.servers.findOne({
            _id: svr.id
        })
        if(serverData.config.log.isEnabled) {
            const channel = await this.bot.channels.fetch(serverData.config.log.channel_id)
            await channel.send({
                embed: {
                    thumbnail: {
                        url: usr.avatarURL()
                    },
                    color: this.bot.configJS.color_codes.YELLOW,
                    title: `⚠️ Message Deleted:`,
                    description: `**${usr.tag}**'s message has been deleted:`,
                    fields: [
                        {
                            name: `✉️ Content:`,
                            value: msg.content,
                            inline: true
                        },
                        {
                            name: `🆔:`,
                            value: msg.id,
                            inline: true
                        },
                        {
                            name: `📨 Sent:`,
                            value: moment(msg.createdTimestamp).format(serverData.config.date_format),
                            inline: true
                        }
                    ],
                    footer: {
                        text: `User ID: ${usr.id} | ${moment(new Date()).format(serverData.config.date_format)}`
                    }
                }
            })
        }
    }
}