const { Command } = require("./../Structures")
const google = require("google-it")

module.exports = class Google extends Command {
    constructor(bot) {
        super(bot, {
            title: "google",
            aliases: [`search`],
            description: "Searches Google.",
            category: `misc`
        })
    }
    run = async (db, msg, serverDocument, userDocument, memberDocument, suffix) => {
        if (suffix) {
            const items = await google({
                query: suffix,
                disableConsole: true
            }).catch(err => {
                this.bot.log.error(`Failed to search Google`, {
                    svr_id: msg.guild.id,
                    msg_id: msg.id
                }, err)
                msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.RED,
                        title: `❌ Error:`,
                        description: `Something went wrong while trying to search Google.`
                    }
                })
            })
            if (items.length > 0) {
                let num = 0;
                items.forEach(i => {
                    if (num < 1) {
                        msg.channel.send({
                            embed: {
                                color: this.bot.getEmbedColor(msg.guild),
                                title: i.title,
                                description: i.snippet,
                                url: i.link,
                                footer: {
                                    text: `Results provided by google-it`
                                }
                            }
                        })
                        num++;
                    }
                })
            } else {
                msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.YELLOW,
                        title: `⚠️ Warning:`,
                        description: `No results were found for '${suffix}'`
                    }
                })
            }
        } else {
            msg.channel.send({
                embed: {
                    color: this.bot.configJS.color_codes.RED,
                    title: `❌ Error:`,
                    description: `I need something to search for!`
                }
            })
        }
    }
}