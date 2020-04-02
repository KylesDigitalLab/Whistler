const moment = require("moment")
const { tz } = require("moment-timezone")
const { Command } = require("../../Structures")

module.exports = class TimezoneCommand extends Command {
    constructor(client) {
        super(client, {
            title: `timezone`,
            aliases: [],
            description: "Sets the server's timezone, for date formatting.",
            permissions: {
                bot: [],
                user: ['MANAGE_GUILD']
            },
            usage: ``,
            category: `utility`
        })
    }
    async run(msg, { 
        Colors
    }, {
       serverDocument
    }, suffix) {
        if(suffix) {
            suffix = suffix.trim()
            const timezone = tz.names().find(t => suffix.toLowerCase() === t.toLowerCase())
            if(timezone) {
                serverDocument.config.timezone = timezone;
                await msg.channel.send({
                    embed: {
                        color: Colors.GREEN,
                        title: `🕑 Success!`,
                        description: `I've set the server's timezone to **${timezone}**.`,
                    }
                })
            } else {
                await msg.channel.send({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        title: `❌ Error:`,
                        description: `I couldn't find that timezone.`,
                    }
                })
            }
        } else {
            await msg.channel.send({
                embed: {
                    color: this.client.getEmbedColor(msg.guild),
                    title: `🕑 Server Timezone:`,
                    description: `The server's timezone is **${serverDocument.config.timezone}**.`,
                }
            })
        }
    }
}