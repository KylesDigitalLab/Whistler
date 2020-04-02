const { Command } = require("../../Structures")
const PaginatedEmbed = require("../../Modules/MessageUtils/PaginatedEmbed")

module.exports = class HelpCommand extends Command {
    constructor(client) {
        super(client, {
            title: "help",
            aliases: [`commands`],
            description: "Lists the bot's commands.",
            usage: `<command>`,
            category: `bot`
        })
        this.capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
    }
    async run(msg, {
        Colors
    }, { 
        serverDocument
    }, suffix) {
        let embedFields = [];
        if (!suffix) {
            //Get a full listing of all commands
            let commands;
            let [titles, descriptions] = [[], []]
            this.client.commands.categories.forEach(async category => {
                if (category.name == "maintainer" && this.client.config.maintainers.includes(msg.author.id)) return;
                commands = this.client.commands.public.all.filter(c => c.data.category == category.name)
                titles.push(`${category.emoji} ${category.long_name} Commands:`)
                descriptions.push(commands.map(cmd => `\`${this.client.commands.getPrefix(serverDocument)}${cmd.data.title}\` - ${cmd.data.description}`).join("\n"))
            })
            await new PaginatedEmbed(this.client, msg, {
                color: this.client.getEmbedColor(msg.guild)
            }, {
                titles,
                descriptions
            }).init()
        } else {
            //Detailed information for individual commands
            suffix = suffix.trim().toLowerCase()
            const cmd = this.client.commands.getPublic(suffix) || this.client.commands.getShared(suffix)
            if (cmd) {
                if (cmd.data.usage) {
                    embedFields.push({
                        name: `Usage:`,
                        value: `\`${cmd.data.title} ${cmd.data.usage}\``
                    })
                }
                await msg.channel.send({
                    embed: {
                        color: this.client.getEmbedColor(msg.guild),
                        title: cmd.data.title,
                        description: cmd.data.description,
                        fields: embedFields
                    }
                })
            } else {
                await msg.channel.send({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        description: `That's not a valid command.`
                    }
                })
            }
        }
    }
}
