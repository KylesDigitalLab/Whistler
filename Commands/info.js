const moment = require("moment")
const os = require("os")
const { Command } = require("./../Structures")

module.exports = class Info extends Command {
    constructor(bot) {
        super(bot, {
            title: "info",
            aliases: [`about`],
            description: "Displays information about the bot.",
            category: `util`
        })
    }
    run = async(db, msg, serverDocument, userDocument, memberDocument, suffix) => {
       await msg.channel.send({
            embed: {
                color: this.bot.getEmbedColor(msg.guild),
                thumbnail: {
                    url: this.bot.user.avatarURL()
                },
                title: `${this.bot.user.username}`,
                fields: [{
                    name: "Servers:",
                    value: this.bot.guilds.cache.size,
                    inline: true
                }, {
                    name: "👥 Users:",
                    value: this.bot.users.cache.size,
                    inline: true
                }, {
                    name: "🆔 User ID:",
                    value: this.bot.user.id,
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