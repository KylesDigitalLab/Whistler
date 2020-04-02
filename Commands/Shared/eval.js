const util = require("util")
const moment = require("moment")
const os = require("os")
const Discord = require("discord.js")
const { Command } = require("../../Structures")
const Stopwatch = require("../../Modules/Utils/Stopwatch")
const GistUploader = require("../../Modules/Utils/GistUpload")

module.exports = class EvalCommand extends Command {
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
                if (typeof result !== "string") {
                    result = util.inspect(result)
                }
                timer.stop()
                if (result.length <= 1980) {
                    await msg.channel.send({
                        embed: {
                            color: this.client.getEmbedColor(msg.guild),
                            description: `\`\`\`js\n${result}\`\`\``,
                            footer: {
                                text: `Execution time: ${Math.round(timer.duration / 2)}ms.`
                            }
                        }
                    })
                } else {
                    const uploader = new GistUploader(this.client)
                    const uploadTimer = new Stopwatch();
                    const res = await uploader.upload({
                        title: "Eval Result",
                        text: result,
                        file: "eval.js",
                    })
                    uploadTimer.stop()
                    res && res.url && await msg.channel.send({
                        embed: {
                            color: Colors.SOFT_ERROR,
                            title: `The eval results were too large!`,
                            description: `As such, I've uploaded them to a gist. Check them out [here](${res.url})`,
                            footer: {
                                text: `Execution time: ${Math.round(timer.duration / 2)}ms | Upload time: ${Math.round(uploadTimer.duration / 2)}ms`
                            }
                        },
                    });
                }
            } catch (err) {
                timer.stop()
                await msg.channel.send({
                    embed: {
                        color: Colors.ERROR,
                        description: `\`\`\`js\n${err ? err.stack : err}\`\`\``,
                        footer: {
                            text: `Execution time: ${Math.round(timer.duration / 2)}ms`
                        }
                    }
                })
            }
        }
    }
}
