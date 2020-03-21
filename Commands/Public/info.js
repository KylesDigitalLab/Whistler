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
    }, {}, suffix) {
       await msg.channel.send({
            embed: {
                color: this.client.getEmbedColor(msg.guild),
                thumbnail: {
                    url: this.client.user.avatarURL()
                },
                title: `${this.client.user.username}`,
                fields: [{
                    name: "Servers:",
                    value: this.client.guilds.cache.size,
                    inline: true
                }, {
                    name: "👥 Users:",
                    value: this.client.users.cache.size,
                    inline: true
                }, {
                    name: "🆔 User ID:",
                    value: this.client.user.id,
                    inline: true
                }, {
                    name: "⏱️ Uptime:",
                    value: moment.duration(Math.floor(process.uptime()), 'seconds').humanize(),
                    inline: true
                }, {
                    name: `Discord.js Version:`,
                    value: require("discord.js").version,
                    inline: true
                }, {
                    name: `Node.js Version:`,
                    value: process.version,
                    inline: true
                },
                {
                    name: `🖥️ Operating System:`,
                    value: os.platform,
                    inline: true
                }, {
                    name: `OS Release:`,
                    value: os.release,
                    inline: true
                }]
            }
        })
    }
}