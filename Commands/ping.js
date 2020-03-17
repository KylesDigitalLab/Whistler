const { Command } = require("./../Structures")
const Stopwatch = require("./../Modules/Stopwatch")

module.exports = class Ping extends Command {
    constructor(bot) {
        super(bot, {
            title: `ping`,
            aliases: [`test`],
            description: "Test the bot's reponse time.",
            category: `main`
        })
    }
    run = async (db, msg, serverData, userData, memberData, suffix) => {
        const timer = new Stopwatch();
        const m = await msg.channel.send(`🏓 Pinging...`)
        timer.stop()
        m.edit(``, {
            embed: {
                color: this.bot.getEmbedColor(msg.guild),
                title: "🏓 Pong!",
                description: `Took **${Math.round(timer.duration / 2)}**ms.`
            }
        })
    }
}