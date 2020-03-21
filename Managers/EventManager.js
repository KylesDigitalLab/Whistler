const Manager   = require("../Structures/Manager")
const { Collection } = require("discord.js");
const { readdir } = require("fs").promises
const clearModuleCache = require("./clearModuleCache")

module.exports = class EventManager extends Manager {
    constructor(client) {
        super(client)
        /**
         * @type {Discord.Collection}
         */
        this.discord = new Collection();
        /**
         * @type {Discord.Collection}
         */
        this.process = new Collection();
    }
    async loadAll(setHandlers) {
        const events = await readdir(`./Events`)
        events.forEach(evtFile => {
            try {
                clearModuleCache(`../Events/${evtFile}`)
                const evt = new (require(`../Events/${evtFile}`))(this.client)
                if(evt.data.type == "discord") {
                    this.discord.set(evt.data.title, evt)
                    if(setHandlers) {
                        this.client.on(evt.data.title, (...args) => {
                            evt.handle(...args).catch(err => {
                                this.client.log.error(`Failed to handle Discord event '${evt.data.title}'`, err)
                            })
                        })
                    }
                } else if (evt.data.type == "process") {
                    this.process.set(evt.data.title, evt)
                    if(setHandlers) {
                        process.on(evt.data.title, (...args) => {
                            evt.handle(...args)
                        })
                    }
                } else {
                    this.client.log.warn(`Event '${evt.data.title}' could not be loaded due to an invalid event type, received ${evt.data.type}`)
                }
            } catch (err) {
                this.client.log.error(`Failed to load event '${evtFile}'!`, err)
            }
        })
        return this;
    }
}