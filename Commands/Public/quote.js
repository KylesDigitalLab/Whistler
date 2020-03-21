const moment = require("moment")
const { Command } = require("../../Structures")

module.exports = class QuoteCommand extends Command {
    constructor(client) {
        super(client, {
            title: "quote",
            aliases: [],
            description: "Quotes a user.",
            usage: `<channel ID> | <message ID>`,
            category: `utility`
        })
    }
    async run(msg, { 
        Colors 
    }, {
        serverDocument
    }, suffix) {
        if (suffix) {
            let chID, mID;
            let args = suffix.trim().split(" ")
            if (args.length == 1) {
                mID = suffix.trim()
                chID = msg.channel.id;
            } else if (args.length > 1) {
                mID = args[1]
                chID = args[0]
            }
            try {
                const ch = await this.client.channels.fetch(chID)
                const m = await ch.messages.fetch(mID)
                msg.channel.send({
                    embed: {
                        color: this.client.getEmbedColor(m.guild),
                        author: {
                            name: m.author.username,
                            iconURL: m.author.avatarURL()
                        },
                        description: m.content,
                        image: {
                            url: `${m.embeds[0] && m.embeds[0].url ? m.embeds[0].url : ""}`
                        },
                        footer: {
                            text: moment(m.createdTimestamp).format(serverDocument.config.date_format)
                        }
                    }
                })
            } catch (err) {
                this.client.log.warn(`Could not fetch channel or message:`, {
                    suffix: suffix,
                    svr_id: msg.guild.id,
                    usr_id: msg.author.id,
                    ch_id: chID
                }, err)
                msg.channel.send({
                    embed: {
                        color: Colors.ERROR,
                        title: `❌ Error:`,
                        description: `I couldn't fetch that message.`,
                        footer: {
                            text: `Specify the channel ID first, then the message ID.`
                        }
                    }
                })
            }
        } else {
            msg.channel.send({
                embed: {
                    color: Colors.SOFT_ERROR,
                    title: `⚠️ Warning:`,
                    description: `I need a message ID to quote.`
                }
            })
        }
    }
}