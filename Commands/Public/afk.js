const moment = require("moment")
const { Command } = require("../../Structures")

module.exports = class AFKCommand extends Command {
    constructor(client) {
        super(client, {
            title: "afk",
            aliases: [],
            description: "Sets an AFK message.",
            usage: ``,
            category: `utility`
        })
    }
    async run(msg, { 
        Colors,
        ImageURLOptions
    }, {
        memberDocument
    }, suffix) {
        if(suffix) {
            suffix = suffix.trim()
            memberDocument.afk_message = suffix;
            await msg.channel.send({
                embed: {
                    color: this.client.getEmbedColor(msg.guild),
                    title: `⌨️ AFK Message`,
                    description: `OK, I've set your AFK message to \`${suffix}\`.`,
                    footer: {
                        text: `To remove it, just send a message.`
                    }
                }
            })
        }
    }
}