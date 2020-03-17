const util = require("util")
const { Command } = require("./../Structures")

module.exports = class Eval extends Command {
    constructor(bot) {
        super(bot, {
            title: `eval`,
            aliases: [`execute`, `run`],
            description: "FOR BOT ADMINISTRATORS ONLY! Executes Node.js code.",
            category: `admin`,
            restricted: true
        })
    }
    run = async (db, msg, serverData, userData, memberData, suffix) => {
        if (suffix) {
            try {
                let result = eval(suffix);
                if (typeof result == "object") result = util.inspect(result)
                msg.channel.send({
                    embed: {
                        color: this.bot.getEmbedColor(msg.guild),
                        title: "Eval Result:",
                        description: `\`\`\`js\n${result}\`\`\``
                    }
                }).catch(err => {
                    this.bot.log.info(result)
                    msg.channel.send({
                        embed: {
                            color: this.bot.configJS.color_codes.RED,
                            title: "❌ Error Sending Result:",
                            description: `\`\`\`js\n${err}\`\`\``,
                            footer: {
                                text: `The result has been sent to the console instead.`
                            }
                        }
                    })
                })
            } catch (err) {
                msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.RED,
                        title: "Eval Result:",
                        description: `\`\`\`js\n${err}\`\`\``
                    }
                })
            }
        }
    }
}
