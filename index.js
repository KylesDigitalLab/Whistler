const { ExtendedClient } = require("./Structures/")
const WebSocket = require("./Web/WebSocket")
const auth = require("./config/auth.json")
const config = require("./config/config.json")
const configJS = require("./config/config.js")
const MongoDriver = require("./Database/Driver")

const bot = new ExtendedClient(config, configJS);
const driver = new MongoDriver(bot);
const web = new WebSocket(bot);

driver.initialize(config.db_url).then(async () => {
    bot.log.info(`Successfully connected to MongoDB database at ${config.db_url}`)
    const db = driver.get()

    try {
        await bot.events.loadAll()
        bot.log.info(`Successfully loaded ${bot.events.discord.size + bot.events.process.size} events`)
    } catch (err) {
        bot.log.error(`Failed to load commands:\r\n`, err)
    }

    try {
        await bot.commands.loadAll()
        bot.log.info(`Successfully loaded ${bot.commands.all.size} commands`)
    } catch(err) {
        bot.log.error(`Failed to load events:\r\n`, err)
    }
    
    try {
        await bot.login(auth.discord.token)
        bot.log.info(`Successfully logged into Discord`)
    } catch(err) {
        bot.log.error(`Failed to login to Discord:\r\n`, err)
    }
    

    bot.once('ready', () => {
        bot.events.discord.get(`ready`).run(db).catch(err => {
            bot.log.error(`Failed to handle event 'ready':\r\n`, err)
        })
    })
    bot.on('message', msg => {
        bot.events.discord.get(`message`).run(db, msg).catch(err => {
            bot.log.error(`Failed to handle event 'message':\r\n`, {
                svr_id: msg.guild.id,
                usr_id: msg.author.id,
                msg_id: msg.id
            }, err)
        })
    })
    bot.on('messageDelete', msg => {
        bot.events.discord.get(`messageDelete`).run(db, msg).catch(err => {
            bot.log.error(`Failed to handle event 'messageDelete':\r\n`, {
                svr_id: msg.guild.id,
                usr_id: msg.author.id,
                msg_id: msg.id
            }, err)
        })
    })
    bot.on(`channelCreate`, ch => {
        bot.events.discord.get('channelCreate').run(db, ch).catch(err => {
            bot.log.error(`Failed to handle event 'channelCreate':\r\n`, {
                ch_id: ch.id,
                svr_id: ch.guild.id
            }, err)
        })
    })
    bot.on(`channelDelete`, ch => {
        bot.events.discord.get('channelDelete').run(db, ch).catch(err => {
            bot.log.error(`Failed to handle event 'channelDelete':\r\n`, {
                ch_id: ch.id,
                svr_id: ch.guild.id
            }, err)
        })
    })
    bot.on(`guildCreate`, svr => {
        bot.events.discord.get('guildCreate').run(db, svr).catch(err => {
            bot.log.error(`Failed to handle event 'guildCreate':\r\n`, {
                svr_id: svr.id
            }, err)
        })
    })
    bot.on(`guildMemberAdd`, member => {
        bot.events.discord.get('guildMemberAdd').run(db, member).catch(err => {
            bot.log.error(`Failed to handle event 'guildMemberAdd':\r\n`, {
                svr_id: member.guild.id,
                usr_id: member.user.id
            }, err)
        })
    })
    bot.on(`guildMemberRemove`, member => {
        bot.events.discord.get('guildMemberRemove').run(db, member).catch(err => {
            bot.log.error(`Failed to handle event 'guildMemberRemove':\r\n`, {
                svr_id: member.guild.id,
                usr_id: member.user.id
            }, err)
        })
    })
    bot.on(`guildBanAdd`, (svr, usr) => {
        bot.events.discord.get('guildBanAdd').run(db, svr, usr).catch(err => {
            bot.log.error(`Failed to handle event 'guildBanAdd':\r\n`, {
                svr_id: svr.id,
                usr_id: usr.id
            }, err)
        })
    })
    bot.on(`rateLimit`, info => {
        bot.log.warn(`Rate limit hit:\r\n`, info)
    })
    bot.on(`debug`, d => {
        bot.events.discord.get(`debug`).run(d).catch(err => {
            bot.log.error(`Failed to handle event 'debug':\r\n`, err, d)
        })
    })
    bot.on('error', error => {
        bot.log.error(`An unexpected error occured:\r\n`, err).catch(err => {
            bot.log.error(`Failed to handle event 'error':\r\n`, err, error)
        })
    })
    bot.on(`invalidated`, () => {
        bot.log.error(`An unknown expection occurred caused the client to be invalidated, and we must terminate the connection. Sorry about that!`)
        bot.destroy();
    })

}).catch(err => bot.log.error('Failed to connect to MongoDB database\r\n', err))

process.on('unhandledRejection', err => {
    bot.events.process.get(`unhandledRejection`).run(err)
})

process.on('uncaughtException', err => {
    bot.log.error(`Uncaught exception:\r\n`, err)
})
