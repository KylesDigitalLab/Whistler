const Manager  = require("../Structures/Manager")
const { Collection } = require("discord.js");
const { readdir } = require("fs").promises

module.exports = class EventManager extends Manager {
    constructor(bot) {
        super(bot)
        /**
         * @type {Discord.Collection}
         */
        this.discord = new Collection();
        /**
         * @type {Discord.Collection}
         */
        this.process = new Collection();
    }
    loadAll = async() => {
        const events = await readdir(`./Events`)
        events.forEach(evtFile => {
            try {
                const path = `../Events/${evtFile}`
                this.bot.log.silly(`Loading event: ${path}`)
                this.bot.clearCache(path)
                const evt = new (require(path))(this.bot)
                if(evt.info.type == "Discord") {
                    this.discord.set(evt.info.title, evt)
                } else if (evt.info.type == "Process") {
                    this.process.set(evt.info.title, evt)
                }
            } catch (err) {
                this.bot.log.error(`Failed to load event '${evtFile}'!`, err)
            } finally {
                this.bot.log.debug(`Successfully loaded event ${evtFile.split(".")[0]}`)
            }
        })
    }
}