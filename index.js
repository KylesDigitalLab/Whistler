const { ExtendedClient } = require("./Structures")
const { config, configJS, auth } = require("./Config")
const MongoDriver = require("./Database/Driver")
const { addToGlobal, ObjectDefines } = require("./Modules/Utils")
const { Constants } = require("./Internals")

ObjectDefines();

const client = new ExtendedClient(config, configJS, {
    client: {
        disableMentions: `everyone`
    }
});
const driver = new MongoDriver(client);

(async () => {
    const db = await driver.initialize(config.db_url)
    client.log.info(`Successfully connected to MongoDB database at ${config.db_url}!`)

    await client.events.loadAll(true)
    client.log.debug(`Successfully loaded ${client.events.discord.size + client.events.process.size} events`)

    await client.commands.loadAll()
    client.log.debug(`Successfully loaded ${client.commands.public.all.size} public commands, ${client.commands.private.all.size} private commands, and ${client.commands.shared.all.size} shared commands`)

    await client.login(auth.discord.clientToken)
    client.log.info(`Successfully logged into Discord`)
})().catch(err => {
    client.log.error(err)
    process.exit(1)
})

module.exports = client;