const exec = require('util').promisify(require('child_process').exec);

const { Command } = require("../../Structures")
const Stopwatch = require("../../Modules/Utils/Stopwatch")

module.exports = class ExecuteCommand extends Command {
    constructor(client) {
        super(client, {
            title: `exec`,
            aliases: [],
            description: "Executes commands on the OS.",
            category: `maintainer`,
            restricted: true
        })
    }
    async run(msg, {
        Colors
    }, { }, suffix) {
        if (suffix) {
            const timer = new Stopwatch();
            try {
                let result = '';
                const { stdout, stderr } = await exec(suffix)
                timer.stop();
                if (stderr) {
                    result += stderr
                }
                if (stdout) {
                    result += stdout
                }
                await msg.channel.send({
                    embed: {
                        color: this.client.getEmbedColor(msg.guild),
                        description: `\`\`\`${result}\`\`\``,
                        footer: {
                            text: `Took ${Math.round(timer.duration / 2)}ms`
                        }
                    }
                })
            } catch (err) {
                timer.stop();
                await msg.channel.send({
                    embed: {
                        color: Colors.ERROR,
                        description: `\`\`\`js\n${err.stack}\`\`\``,
                        footer: {
                            text: `Took ${Math.round(timer.duration / 2)}ms`
                        }
                    }
                })
            }
            timer.stop()
        }
    }
}
