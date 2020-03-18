const { Command } = require("./../Structures")

module.exports = class Prefix extends Command {
    constructor(bot) {
        super(bot, {
            title: "prefix",
            aliases: [],
            permissions: ["ADMINISTRATOR"],
            description: "Set a custom prefix for the server.",
            category: `util`
        })
    }
    run = async (db, msg, serverData, userData, memberData, suffix) => {
        if (suffix) {
            if (suffix.length < 10) {
                serverData.config.prefix = suffix;
                await msg.channel.send({
                    embed: {
                        color: this.bot.getEmbedColor(msg.guild),
                        title: `✅ Success!`,
                        description: `Prefix changed to \`${suffix}\``
                    }
                })
            } else {
                await msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.RED,
                        title: `❌ Error:`,
                        description: `Your prefix is too long!`
                    }
                })
            }
        }
    }
}