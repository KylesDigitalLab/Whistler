const { ExtendedClient } = require("./Structures/")
const auth = require("./config/auth.json")
const config = require("./config/config.json")
const configJS = require("./config/config.js")
const MongoDriver = require("./Database/Driver")
const StructureExtender = require("./Modules/Utils/StructureExtender")

StructureExtender();
const bot = new ExtendedClient(config, configJS);
const driver = new MongoDriver(bot);

driver.initialize(config.db_url).then(async db => {
    bot.log.info(`Successfully connected to MongoDB database at ${config.db_url}!`)

    try {
        await bot.events.loadAll()
        bot.log.info(`Successfully loaded ${bot.events.discord.size + bot.events.process.size} events!`)
    } catch (err) {
        bot.log.error(`Failed to load commands!`, err)
    }

    try {
        await bot.commands.loadAll()
        bot.log.info(`Successfully loaded ${bot.commands.all.size} commands!`)
    } catch (err) {
        bot.log.error(`Failed to load events:`, err)
    }

    try {
        await bot.login(auth.discord.token)
        bot.log.info(`Successfully logged into Discord`)
    } catch (err) {
        bot.log.error(`Failed to login to Discord:`, err)
    }


    bot.once('ready', () => {
        bot.events.discord.get(`ready`).handle(db).catch(err => {
            bot.log.error(`Failed to handle event 'ready':`, err)
        })
    })
    bot.on('message', msg => {
        bot.events.discord.get(`message`).handle(db, msg).catch(err => {
            bot.log.error(`Failed to handle event 'message':`, {
                svr_id: `${msg.guild ? msg.guild.id : "DM"}`,
                usr_id: msg.author.id,
                msg_id: msg.id
            }, err)
        })
    })
    bot.on('messageDelete', msg => {
        bot.events.discord.get(`messageDelete`).handle(db, msg).catch(err => {
            bot.log.error(`Failed to handle event 'messageDelete':`, {
                svr_id: `${msg.guild ? msg.guild.id : "DM"}`,
                usr_id: msg.author.id,
                msg_id: msg.id
            }, err)
        })
    })
    bot.on(`channelCreate`, ch => {
        bot.events.discord.get('channelCreate').handle(db, ch).catch(err => {
            bot.log.error(`Failed to handle event 'channelCreate':`, {
                ch_id: ch.id,
                svr_id: `${ch.guild ? ch.guild.id : "DM"}`
            }, err)
        })
    })
    bot.on(`channelDelete`, ch => {
        bot.events.discord.get('channelDelete').handle(db, ch).catch(err => {
            bot.log.error(`Failed to handle event 'channelDelete':`, {
                ch_id: ch.id,
                svr_id: `${ch.guild ? ch.guild.id : "DM"}`
            }, err)
        })
    })
    bot.on(`guildCreate`, svr => {
        bot.events.discord.get('guildCreate').handle(db, svr).catch(err => {
            bot.log.error(`Failed to handle event 'guildCreate':`, {
                svr_id: svr.id
            }, err)
        })
    })
    bot.on(`guildMemberAdd`, member => {
        bot.events.discord.get('guildMemberAdd').handle(db, member).catch(err => {
            bot.log.error(`Failed to handle event 'guildMemberAdd':`, {
                svr_id: member.guild.id,
                usr_id: member.user.id
            }, err)
        })
    })
    bot.on(`guildMemberRemove`, member => {
        bot.events.discord.get('guildMemberRemove').handle(db, member).catch(err => {
            bot.log.error(`Failed to handle event 'guildMemberRemove':`, {
                svr_id: member.guild.id,
                usr_id: member.user.id
            }, err)
        })
    })
    bot.on(`guildBanAdd`, (svr, usr) => {
        bot.events.discord.get('guildBanAdd').handle(db, svr, usr).catch(err => {
            bot.log.error(`Failed to handle event 'guildBanAdd':`, {
                svr_id: svr.id,
                usr_id: usr.id
            }, err)
        })
    })
    bot.on(`rateLimit`, info => {
        bot.log.warn(`Rate limit hit!`, info)
    })
    bot.on(`debug`, d => {
        bot.events.discord.get(`debug`).handle(d).catch(err => {
            bot.log.error(`Failed to handle event 'debug':`, err, d)
        })
    })
    bot.on('error', error => {
        bot.log.error(`An unexpected error occured:\r\n`, err).catch(err => {
            bot.log.error(`Failed to handle event 'error':`, err, error)
        })
    })
    bot.on(`invalidated`, () => {
        bot.log.error(`An unknown expection occurred caused the client to be invalidated, and we must terminate the connection. Sorry about that!`)
        bot.destroy();
    })
    bot.on(`raw`, packet => {
        bot.log.silly(`Received ${packet.t} event from Discord`)
    })

}).catch(err => {
    bot.log.error('Failed to connect to MongoDB database!', err)
})

process.on('unhandledRejection', err => {
    bot.events.process.get(`unhandledRejection`).handle(err)
})

process.on('uncaughtException', err => {
    bot.log.error(`Uncaught Exception:`, err)
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