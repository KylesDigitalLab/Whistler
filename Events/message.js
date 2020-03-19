const { Event } = require("../Structures")
const moment = require("moment")
const Stopwatch = require("../Modules/Utils/Stopwatch")

module.exports = class MessageCreate extends Event {
    constructor(bot) {
        super(bot, {
            title: `message`,
            type: `Discord`
        })
    }
    checkRequirements = async msg => {
        if (msg.author.id == this.bot.user.id) {
            this.bot.log.verbose(`Ignoring self-message.`, {
                svr_id: `${msg.guild ? msg.guild.id : "DM"}`,
                ch_id: msg.channel.id,
                msg_id: msg.id
            })
            return false;
        }
        if (msg.author.bot) {
            this.bot.log.verbose(`Ignoring message from bot ${msg.author.tag}.`, {
                svr_id: `${msg.guild ? msg.guild.id : "DM"}`,
                ch_id: msg.channel.id,
                msg_id: msg.id,
                content: msg.content
            })
            return false;
        }
        if (msg.type !== "DEFAULT") {
            this.bot.log.verbose(`Ignoring non-default message.`, {
                svr_id: `${msg.guild ? msg.guild.id : "DM"}`,
                ch_id: msg.channel.id,
                msg_id: msg.id
            })
            return false;
        }
        if (this.bot.config.userBlocklist.includes(msg.author.id)) {
            this.bot.log.verbose(`Ignoring message from blocked user ${msg.author.tag}.`, {
                svr_id: `${msg.guild ? msg.guild.id : "DM"}`,
                ch_id: msg.channel.id,
                msg_id: msg.id,
                content: msg.content
            })
            return false;
        }
        return true;
    }
    handle = async (db, msg) => {
        const timer = new Stopwatch();
        if (await this.checkRequirements(msg)) {
            if (!msg.guild) {
                this.bot.log.silly(`Received new direct message from ${msg.author.tag}`, {
                    usr_id: msg.author.id,
                    msg_id: msg.id,
                    msg_content: msg.content
                })
                if (this.bot.configJS.maintainer_config.forwardDMs && !this.bot.config.maintainers.includes(msg.author.id)) {
                    this.bot.config.maintainers.forEach(async usrID => {
                        let user = this.bot.users.cache.get(usrID)
                        if (!user) {
                            user = await this.bot.users.fetch(usrID)
                        }
                        const DM = await user.createDM()
                        await DM.send({
                            embed: {
                                color: this.bot.configJS.color_codes.BLUE,
                                author: {
                                    name: msg.author.tag,
                                    iconURL: msg.author.avatarURL()
                                },
                                title: `📨 DM Received:`,
                                description: `\`\`\`${msg.content}\`\`\``,
                                footer: {
                                    text: `Message ID: ${msg.id} | User ID: ${msg.author.id} | ${moment(msg.createdTimestamp).format(this.bot.configJS.date_format)}`
                                }
                            }
                        })
                    })
                }
            } else {
                this.bot.log.silly(`New message sent by ${msg.author.tag} in ${msg.guild.name}`, {
                    svr_id: msg.guild.id,
                    ch_id: msg.channel.id,
                    msg_id: msg.id
                })
                await msg.guild.populateDocument()
                const serverDocument = msg.guild.serverDocument;
                if (serverDocument) {
                    let channelData = serverDocument.channels.id(msg.channel.id)
                    if (!channelData) {
                        this.bot.log.debug(`Channel data not found, creating now`, {
                            ch_id: msg.channel.id,
                            svr_id: msg.guild.id
                        })
                        serverDocument.channels.push({
                            _id: msg.channel.id
                        })
                        channelData = serverDocument.channels.id(msg.channel.id)
                    }
                    const memberDocument = msg.member.memberDocument;
                    memberDocument.last_active = Date.now()
                    memberDocument.message_count++;
                    const userDocument = await db.users.findOrCreate({
                        _id: msg.author.id
                    })
                    userDocument.last_active = Date.now()
                    let cmd = this.bot.commands.check(msg.content, serverDocument)
                    if (cmd) {
                        let command = this.bot.commands.all.get(cmd.command) || this.bot.commands.all.get(this.bot.commands.aliases.get(cmd.command))
                        if (command) {
                            if (serverDocument.config.commands.delete_messages && msg.guild.me.hasPermission("MANAGE_MESSAGES")) {
                                try {
                                    const m = await msg.delete();
                                    this.bot.log.verbose(`Deleted command message by ${msg.author.tag}`, {
                                        msg_id: m.id,
                                        svr_id: m.guild.id
                                    })
                                } catch (_) {
                                    //Eh
                                }
                            }
                            this.bot.log.info(`Treating '${msg.content}' as command '${command.info.title}'`, {
                                svr_id: msg.guild.id,
                                usr_id: msg.author.id
                            })
                            if (await command.checkPermissions(msg)) {
                                await command.run(db, msg, serverDocument, userDocument, memberDocument, cmd.suffix).catch(err => {
                                    this.bot.log.error(`Failed to execute command '${command.info.title}'`, {
                                        svr_id: msg.guild.id,
                                        usr_id: msg.author.id,
                                        msg_id: msg.id
                                    }, err)
                                    msg.channel.send({
                                        embed: {
                                            color: this.bot.configJS.color_codes.RED,
                                            title: `❌ Error:`,
                                            description: `Something went wrong!`,
                                            footer: {
                                                text: `The debug information has been sent to the maintainers.`
                                            }
                                        }
                                    })
                                })
                            }
                        }
                    }
                    await userDocument.save()
                    this.bot.log.silly(`Successfully saved user document for ${msg.author.tag}`, {
                        svr_id: msg.guild.id,
                        usr_id: msg.author.id
                    })
                    await serverDocument.save()
                    this.bot.log.silly(`Successfully saved server document for ${msg.guild.name}`, {
                        svr_id: msg.guild.id
                    })
                } else {
                    this.bot.log.error(`Could not find server document for ${msg.guild.name}!`, {
                        svr_id: msg.guild.id,
                        serverDocument: serverDocument
                    })
                }
            }
        }
        timer.stop()
        this.bot.log.verbose(`Successfully finished handling Discord message. Took ${Math.round(timer.duration / 2)}ms.`, {
            svr_id: `${msg.guild ? msg.guild.id : "DM"}`,
            ch_id: msg.channel.id,
            usr_id: msg.author.id
        })
    }
}