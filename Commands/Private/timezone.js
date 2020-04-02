const moment = require("moment")
const { tz } = require("moment-timezone")
const { Command } = require("../../Structures")

module.exports = class PrivateTimezoneCommand extends Command {
    constructor(client) {
        super(client, {
            title: `timezone`,
            aliases: [],
            description: "Sets the user's timezone. This command overrides the server's timezone.",
            usage: ``,
            category: `utility`
        })
    }
    async run(msg, { 
        Colors
    }, {
       userDocument
    }, suffix) {
        if(suffix) {
            suffix = suffix.trim()
            const timezone = tz.names().find(t => suffix.toLowerCase() === t.toLowerCase())
            if(timezone) {
                userDocument.timezone = timezone;
                await msg.channel.send({
                    embed: {
                        color: Colors.GREEN,
                        title: `🕑 Success!`,
                        description: `I've set your timezone to **${timezone}**.`,
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
                    color: this.client.getEmbedColor(),
                    title: `🕑 Timezone:`,
                    description: `Your current timezone is **${userDocument.timezone}**.`,
                }
            })
        }
    }
}