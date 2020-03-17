const moment = require("moment")
const { Command } = require("./../Structures")

module.exports = class User extends Command {
    constructor(bot) {
        super(bot, {
            title: "quote",
            aliases: [],
            description: "Quotes a user.",
            category: `util`
        })
    }
    run = async (db, msg, serverData, userData, memberData, suffix) => {
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
                const ch = await this.bot.channels.fetch(chID)
            } catch (err) {
                this.bot.log.warn(`Could not fetch channel:`, {
                    suffix: suffix,
                    svr_id: msg.guild.id,
                    usr_id: msg.author.id
                }, err)
                msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.RED,
                        title: `❌ Error:`,
                        description: `I couldn't fetch that channel.`,
                        footer: {
                            text: `Specify the channel ID first, then the message ID.`
                        }
                    }
                })
            }
            try {
                const m = await ch.messages.fetch(mID)
                msg.channel.send({
                    embed: {
                        color: this.bot.getEmbedColor(m.guild),
                        author: {
                            name: m.author.username,
                            iconURL: m.author.avatarURL()
                        },
                        description: m.content,
                        image: {
                            url: `${m.embeds[0] && m.embeds[0].url ? m.embeds[0].url : ""}`
                        },
                        footer: {
                            text: moment(m.createdTimestamp).format(serverData.config.date_format)
                        }
                    }
                })
            } catch (err) {
                this.bot.log.warn(`Could not fetch message:`, {
                    suffix: suffix,
                    svr_id: msg.guild.id,
                    usr_id: msg.author.id
                }, err)
                msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.RED,
                        title: `❌ Error:`,
                        description: `I couldn't get that message.`,
                        footer: {
                            text: `I need a message ID.`
                        }
                    }
                })
            }
        } else {
            msg.channel.send({
                embed: {
                    color: this.bot.configJS.color_codes.YELLOW,
                    title: `⚠️ Warning:`,
                    description: `I need a message ID to quote.`
                }
            })
        }
    }
}