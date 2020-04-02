const moment = require("moment")
const os = require("os")
const { Command } = require("../../Structures")

module.exports = class BotInfoCommand extends Command {
    constructor(client) {
        super(client, {
            title: "info",
            aliases: [`about`],
            description: "Displays information about the bot.",
            category: `utility`
        })
    }
    async run(msg, {
        Colors
    }, { }, suffix) {
        let cores;
        switch (os.cpus().length) {
            case 1:
                cores = "single"
                break;
            case 2:
                cores = "dual"
                break;
            case 4:
                cores = "quad"
                break;
            default:
                cores = os.cpus().length
        }
        await msg.channel.send({
            embed: {
                color: this.client.getEmbedColor(msg.guild),
                thumbnail: {
                    url: this.client.user.avatarURL()
                },
                title: `${this.client.user.username}`,
                fields: [{
                    name: `🤖 General Information:`,
                    value: `This bot manages **${this.client.guilds.cache.size}** servers with a total of **${this.client.users.cache.size}** users.`,
                    inline: true
                },
                {
                    name: "🆔 User:",
                    value: `Using account **${this.client.user.tag}** (ID: ${this.client.user.id})`,
                    inline: true
                },
                {
                    name: `💾 Process Info:`,
                    value: `Using ${Math.ceil(process.memoryUsage().heapTotal / 1000000)}MB RAM with PID ${process.pid}.`,
                    inline: true
                },
                {
                    name: "⏱️ Uptime:",
                    value: moment.duration(Math.floor(process.uptime()), 'seconds').humanize(),
                    inline: true
                },
                {
                    name: `ℹ️ Version:`,
                    value: `Using Node.js ${process.version} with Discord.js v${require("discord.js").version}.`
                },
                {
                    name: `🖥️ Operating System:`,
                    value: `Hosted on ${os.platform} ${os.release}, using a ${cores}-core processor with ${os.arch()} architecture, with ${Math.ceil(os.totalmem() / 1000000)}MB RAM.`,
                    inline: true
                }],
                footer: {
                    text: `This server is on shard ${msg.guild.shard.id}.`
                }
            }
        })
    }
}