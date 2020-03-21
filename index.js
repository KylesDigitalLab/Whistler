const { ExtendedClient } = require("./Structures")
const {config, configJS, auth} = require("./Config")
const MongoDriver = require("./Database/Driver")
const { StructureExtender, addToGlobal } = require("./Modules/Utils")
const { Constants } = require("./Internals")

addToGlobal("formatNumber", num => {
    switch(typeof num) {
        case 'number':
            return num.toLocaleString("en-US")
        case 'string':
            return parseInt(num).toLocaleString("en-US")
        default:
            return null;
    }
})
StructureExtender();
const client = new ExtendedClient(config, configJS);
const driver = new MongoDriver(client);

driver.initialize(config.db_url).then(async db => {
    client.log.info(`Successfully connected to MongoDB database at ${config.db_url}!`)

    try {
        await client.events.loadAll(true)
        client.log.info(`Successfully loaded ${client.events.discord.size + client.events.process.size} events!`)
    } catch (err) {
        client.log.error(`Failed to load events!`, err)
    }

    try {
        await client.commands.loadAll()
        client.log.info(`Successfully loaded ${client.commands.public.all.size} public commands, ${client.commands.private.all.size} private commands, and ${client.commands.shared.all.size} shared commands!`)
    } catch (err) {
        client.log.error(`Failed to load commands!`, err)
    }

    try {
        await client.login(auth.discord.clientToken)
        client.log.info(`Successfully logged into Discord!`)
    } catch (err) {
        client.log.error(`Failed to login to Discord:`, err)
    }

}).catch(err => {
    client.log.error('Failed to connect to MongoDB database!', err)
})

Object.defineProperty(Boolean.prototype, `humanize`, {
    value: () => {
        if (this) {
            return "enabled";
        } else {
            return "disabled";
        }
    }
})

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
}