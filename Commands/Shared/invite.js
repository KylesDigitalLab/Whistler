const { Command } = require("../../Structures")

module.exports = class InviteCommand extends Command {
    constructor(client) {
        super(client, {
            title: "invite",
            aliases: [],
            description: `Generates an invite link to add the bot.`,
            usage: ``,
            category: `bot`
        })
    }
    async run(msg, {
        Colors
    }, { }, suffix) {
        await msg.channel.send({
            embed: {
                url: await this.client.generateInvite(['ADMINISTRATOR']),
                color: Colors.INFO,
                title: `🔗 Click here to add me to your server!`,
                description: `Thank you for choosing **${this.client.user.username}**, a multi-purpose Discord bot.`,
            }
        })
    }
}
