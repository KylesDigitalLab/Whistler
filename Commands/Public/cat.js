const { Command } = require("../../Structures")
const { get } = require("axios")

module.exports = class CatCommand extends Command {
    constructor(client) {
        super(client, {
            title: "cat",
            aliases: [`kitten`, `meow`],
            description: "Shows a random cat picture.",
            category: `media`
        })
    }
    async run(msg, {APIs}, {}, suffix) {
        const { data } = await get(APIs.CAT);
        await msg.channel.send({
            embed: {
                color: this.client.getEmbedColor(msg.guild),
                image: {
                    url: data.file
                },
                title: `🐱 Meow!`,
                footer: {
                    text: `Image provided by random.cat`
                }
            }
        })
    }
}