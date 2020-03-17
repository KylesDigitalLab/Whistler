const { Event } = require("../Structures")

module.exports = class Warn extends Event {
    constructor(bot) {
        super(bot, {
            title: `warn`,
            type: `Discord`
        })
    }
    run = async warning => this.bot.log.warn(`Client warning:\r\n`, warning)
}