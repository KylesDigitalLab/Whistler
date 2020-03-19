const { Command } = require("./../Structures")
const moment = require("moment")

module.exports = class Server extends Command {
    constructor(bot) {
        super(bot, {
            title: "server",
            aliases: ["serverinfo", "guild"],
            description: "Shows information about the current server the user is in.",
            category: `util`
        })
    }
    run = async(db, msg, serverDocument, userDocument, memberDocument, suffix) => {
        let svr = msg.guild;
        let [userCount, botCount] = [svr.members.cache.filter(m => !m.user.bot).size, svr.members.cache.filter(m => m.user.bot).size]
        await msg.channel.send({
            embed: {
                color: this.bot.getEmbedColor(msg.guild),
                title: `Information about ${svr.name}:`,
                thumbnail: {
                    url: svr.iconURL()
                },
                fields: [
                    {
                        name: `Name:`,
                        value: svr.name,
                        inline: true
                    },
                    {
                        name: `🆔:`,
                        value: svr.id,
                        inline: true
                    },
                    {
                        name: `🌐 Region:`,
                        value: svr.region,
                        inline: true
                    },
                    {
                        name: `👥 Members:`,
                        value: `${userCount} user${userCount == 1 ? "" : "s"}, ${botCount} bot${botCount == 1 ? "" : "s"}\n(${svr.memberCount} total)`,
                        inline: true
                    },
                    {
                        name: `Roles:`,
                        value: svr.roles.cache.filter(r => !r.managed).map(r => r.toString()),
                        inline: true
                    },
                    {
                        name: `Emojis:`,
                        value: svr.emojis.cache.map(e => e.toString()),
                        inline: true
                    },
                    {
                        name: `🗓️ Created:`,
                        value: `${moment(svr.createdAt).format(serverDocument.config.date_format)} (${moment(svr.createdAt).fromNow()})`,
                        inline: true
                    }
                ]
            }
        })
    }
}
