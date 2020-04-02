const { Command } = require("../../Structures")

module.exports = class PrefixCommand extends Command {
    constructor(client) {
        super(client, {
            title: "prefix",
            aliases: [],
            permissions: {
                bot: [],
                user: ["MANAGE_GUILD"]
            },
            description: "Set a custom command prefix for the server.",
            usage: `<prefix>`,
            category: `bot`
        })
    }
    async run(msg, {
        Colors
    }, {
        serverDocument
    }, suffix) {
        if (suffix) {
            suffix = suffix.trim()
            if (suffix.length < 10) {
                serverDocument.config.prefix = suffix
                await msg.channel.send({
                    embed: {
                        color: this.client.getEmbedColor(msg.guild),
                        title: `✅ Success!`,
                        description: `Prefix changed to \`${suffix}\``
                    }
                })
            } else {
                await msg.channel.send({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        title: `❌ Error:`,
                        description: `Your prefix is too long!`
                    }
                })
            }
        } else {
            await msg.channel.send({
                embed: {
                    color: this.client.getEmbedColor(msg.guild),
                    description: `My command prefix is \`${this.client.commands.getPrefix(serverDocument)}\`.`
                }
            })
        }
    }
}