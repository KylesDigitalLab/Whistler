const { Command } = require("./../Structures")

module.exports = class Help extends Command {
    constructor(bot) {
        super(bot, {
            title: "help",
            aliases: [`commands`],
            description: "Lists the bot's commands.",
            category: `main`
        })
    }
    run = async(db, msg, serverData, userData, memberData, suffix) => {
        let embedFields = [];
        this.bot.commands.all.forEach(cmd => {
            if (!cmd.info.restricted) {
                embedFields.push({
                    name: `**${cmd.info.title}**`,
                    value: cmd.info.description,
                    inline: true
                })
            }
        })
        await msg.channel.send({
            embed: {
                title: "Commands:",
                color: this.bot.getEmbedColor(msg.guild),
                fields: embedFields
            }
        })
    }
}
