const { Event } = require("../Structures")

module.exports = class DebugEvent extends Event {
    constructor(bot) {
        super(bot, {
            title: `debug`,
            type: `Discord`
        })
    }
    handle = async info => this.bot.log.verbose(info)
}
