const util = require("util")
const { Command } = require("../../Structures")
const Stopwatch = require("../../Modules/Utils/Stopwatch")

module.exports = class Eval extends Command {
    constructor(client) {
        super(client, {
            title: `eval`,
            aliases: [`execute`, `run`],
            description: "Executes Node.js code.",
            category: `maintainer`,
            restricted: true
        })
    }
    async run(msg, { 
        Colors 
    }, {
        serverDocument,
        userDocument,
        memberDocument,
        channelDocument
    }, suffix) {
        if (suffix) {
            const timer = new Stopwatch();
            try {
                let result = await eval(suffix);
                if (typeof result == "object") {
                    result = util.inspect(result)
                }
                timer.stop()
                await msg.channel.send({
                    embed: {
                        color: this.client.getEmbedColor(msg.guild),
                        description: `\`\`\`js\n${result}\`\`\``,
                        footer: {
                            text: `Execution time: ${Math.round(timer.duration / 2)}ms.`
                        }
                    }
                }).catch(async err => {
                    timer.stop()
                    this.client.log.info(result)
                    await msg.channel.send({
                        embed: {
                            color: Colors.SOFT_ERROR,
                            title: "❌ Error Sending Result:",
                            description: `\`\`\`js\n${err}\`\`\``,
                            footer: {
                                text: `Execution time: ${Math.round(timer.duration / 2)}ms | The result has been sent to the console instead.`
                            }
                        }
                    })
                })
            } catch (err) {
                timer.stop()
                await msg.channel.send({
                    embed: {
                        color: Colors.ERROR,
                        description: `\`\`\`js\n${err.stack}\`\`\``,
                        footer: {
                            text: `Execution time: ${Math.round(timer.duration / 2)}ms`
                        }
                    }
                })
            }
        }
    }
}
