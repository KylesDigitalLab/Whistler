const { Command } = require("../../Structures")
const moment = require("moment")

module.exports = class RoleInfoCommand extends Command {
    constructor(client) {
        super(client, {
            title: "roleinfo",
            aliases: [],
            description: "Shows information about a server's roles.",
            category: `utility`
        })
    }
    async run(msg, {
        Colors
    }, {
        serverDocument
    }, suffix) {
        await msg.channel.send({
            embed: {
                color: this.client.getEmbedColor(msg.guild),
                title: `Role Information:`,
                thumbnail: {
                    url: msg.guild.iconURL()
                },
                description: `This server has ${msg.guild.roles.cache.size} roles.`,
                fields: [
                    {
                        name: `All Roles:`,
                        value: msg.guild.roles.cache.filter(r => !r.managed).map(r => r.toString()),
                        inline: true
                    }
                ],
            }
        })
    }
}
