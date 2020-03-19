const util = require("util")
const { Command } = require("./../Structures")
const Stopwatch = require("../Modules/Utils/Stopwatch")

module.exports = class Eval extends Command {
    constructor(bot) {
        super(bot, {
            title: `eval`,
            aliases: [`execute`, `run`],
            description: "Executes Node.js code.",
            category: `admin`,
            restricted: true
        })
    }
    run = async (db, msg, serverDocument, userDocument, memberDocument, suffix) => {
        if (suffix) {
            const timer = new Stopwatch();
            try {
                let result = eval(suffix);
                if (typeof result == "object") {
                    result = util.inspect(result)
                }
                timer.stop()
                await msg.channel.send({
                    embed: {
                        color: this.bot.getEmbedColor(msg.guild),
                        description: `\`\`\`js\n${result}\`\`\``,
                        footer: {
                            text: `Execution time: ${Math.round(timer.duration / 2)}ms.`
                        }
                    }
                }).catch(async err => {
                    this.bot.log.info(result)
                    await msg.channel.send({
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
                timer.stop()
                await msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.RED,
                        description: `\`\`\`js\n${err}\`\`\``,
                        footer: {
                            text: `Execution time: ${Math.round(timer.duration / 2)}ms`
                        }
                    }
                })
            }
            if(timer.running) {
                timer.stop()
            }
        }
    }
}
