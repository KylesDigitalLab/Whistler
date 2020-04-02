const { Command } = require("../../Structures")
const { Stopwatch } = require("../../Modules/Utils")

module.exports = class PingCommand extends Command {
    constructor(client) {
        super(client, {
            title: `ping`,
            aliases: [`test`],
            description: "Test the bot's reponse time.",
            category: `bot`
        })
    }
    async run(msg, { 
        Colors 
    }, {}, suffix) {
        const timer = new Stopwatch();
        const m = await msg.channel.send({
            embed: {
                color: Colors.YELLOW,
                title: `🏓 Hold on...`,
                description: `We're getting the ping...`,
                footer: {
                    text: `This shouldn't take long...`
                }
            }
        })
        await timer.stop()
        await m.edit({
            embed: {
                color: this.client.getEmbedColor(msg.guild),
                title: "🏓 Pong!",
                description: `Took **${Math.round(timer.duration / 2)}**ms. Websocket ping is **${this.client.ws.ping}**ms.`,
                footer: {
                    //I don't have sharding setup at the moment but whatever
                    text: `This server is on shard ${msg.guild.shard.id}.`
                }
            }
        })
    }
}