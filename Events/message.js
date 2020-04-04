const { Event } = require("../Structures")
const moment = require("moment")
const { DiscordAPIError } = require("discord.js")
const { Stopwatch } = require("../Modules/Utils")
const { Constants } = require("../Internals")

module.exports = class messageCreate extends Event {
    constructor(client) {
        super(client, {
            title: `message`,
            type: `discord`
        })
    }
    async checkRequirements(msg) {
        if (msg.author.id == this.client.user.id) {
            this.client.log.verbose(`Ignoring self-message.`, {
                svr_id: msg.guild ? msg.guild.id : "DM",
                ch_id: msg.channel.id,
                msg_id: msg.id
            })
            return false;
        }
        if (msg.author.bot) {
            this.client.log.verbose(`Ignoring message from bot ${msg.author.tag}.`, {
                svr_id: msg.guild ? msg.guild.id : "DM",
                ch_id: msg.channel.id,
                msg_id: msg.id
            })
            return false;
        }
        if(msg.webhookID) {
            this.client.log.verbose(`Ignoring message from webhook.`, {
                svr_id: msg.guild ? msg.guild.id : "DM",
                ch_id: msg.channel.id,
                msg_id: msg.id,
                webhook_id: msg.webhookID
            })
            return false;
        }
        if (msg.type !== "DEFAULT") {
            this.client.log.verbose(`Ignoring non-default message.`, {
                svr_id: `${msg.guild ? msg.guild.id : "DM"}`,
                ch_id: msg.channel.id,
                msg_id: msg.id
            })
            return false;
        }
        if (this.client.config.userBlocklist.includes(msg.author.id)) {
            this.client.log.verbose(`Ignoring message from blocked user ${msg.author.tag}.`, {
                svr_id: `${msg.guild ? msg.guild.id : "DM"}`,
                ch_id: msg.channel.id,
                msg_id: msg.id,
                content: msg.content
            })
            return false;
        }
        return true;
    }
    async handle(msg) {
        const timer = new Stopwatch();
        if (await this.checkRequirements(msg)) {
            if (!msg.guild) {
                this.client.log.silly(`Received new direct message from ${msg.author.tag}`, {
                    usr_id: msg.author.id,
                    msg_id: msg.id,
                    msg_content: msg.content
                })
                if (this.client.configJS.maintainer_config.forwardDMs && !this.client.config.maintainers.includes(msg.author.id)) {
                    for (const id of this.client.config.maintainers) {
                        let user = this.client.users.cache.get(id)
                        if (!user) {
                            user = await this.client.users.fetch(id)
                        }
                        const ch = await user.createDM()
                        await ch.send({
                            embed: {
                                color: Constants.Colors.INFO,
                                author: {
                                    name: msg.author.tag,
                                    iconURL: msg.author.avatarURL()
                                },
                                title: `📨 DM Received:`,
                                description: `\`\`\`${msg.content}\`\`\``,
                                footer: {
                                    text: `Message ID: ${msg.id} | User ID: ${msg.author.id} | ${moment(msg.createdTimestamp).format(this.client.configJS.date_format)}`
                                }
                            }
                        })
                    }
                }
                const userDocument = await msg.author.populateDocument();
                userDocument.last_active = Date.now()

                const cmd = this.client.commands.check(msg.content)
                if (cmd) {
                    const command = this.client.commands.getPrivate(cmd.command) || this.client.commands.getShared(cmd.command)
                    if (command) {
                        this.client.log.info(`Treating '${msg.content}' as private command '${command.data.title}'`, {
                            usr_id: msg.author.id
                        })
                        if (await command.checkPermissions(msg)) {
                            await command.run(msg, Constants, {
                                userDocument
                            }, cmd.suffix).catch(async err => {
                                this.client.log.error(`Failed to run private command '${cmd.data.title}'`, {
                                    usr_id: msg.author.id
                                }, err)
                                await msg.channel.send({
                                    embed: {
                                        color: Constants.Colors.RED,
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
            } else {
                this.client.log.silly(`New message sent by ${msg.author.tag} in ${msg.guild.name}`, {
                    svr_id: msg.guild.id,
                    ch_id: msg.channel.id,
                    msg_id: msg.id
                })
                const serverDocument = await msg.guild.populateDocument()
                if (serverDocument) {
                    const channelDocument = msg.channel.document;
                    const memberDocument = msg.member.document;

                    memberDocument.last_active = Date.now()
                    memberDocument.message_count++;

                    const userDocument = await msg.author.populateDocument()
                    userDocument.last_active = Date.now()

                    if (memberDocument.afk_message) {
                        memberDocument.afk_message = null;
                        await msg.channel.send({
                            embed: {
                                color: Constants.Colors.INFO,
                                description: `👋 Welcome back, ${msg.author.toString()}! I've removed your AFK message.`
                            }
                        })
                    }

                    msg.mentions.members.forEach(async member => {
                        let mDocument = member.memberDocument;
                        if (mDocument.afk_message) {
                            await msg.channel.send({
                                embed: {
                                    color: Constants.INFO,
                                    description: `⌨️ **${member.user.username}** is currently AFK:\`\`\`${mDocument.afk_message}\`\`\``
                                }
                            })
                        }
                    })

                    if (channelDocument.bot_enabled) {
                        if (!memberDocument.blocked) {
                            if (msg.mentions.members.has(this.client.user.id)) {
                                let prefix = this.client.commands.getPrefix(serverDocument)
                                await msg.channel.send({
                                    embed: {
                                        color: this.client.getEmbedColor(msg.guild),
                                        description: `My command prefix is \`${prefix}\``,
                                        footer: {
                                            text: `Respond with ${prefix}help for more information!`
                                        }
                                    }
                                })
                                return;
                            }
                            const cmd = this.client.commands.check(msg.content, serverDocument)
                            if (cmd) {
                                let command = this.client.commands.getPublic(cmd.command) || this.client.commands.getShared(cmd.command)
                                if (command) {
                                    if (serverDocument.config.commands.delete_messages && msg.guild.me.hasPermission("MANAGE_MESSAGES")) {
                                        const m = await msg.delete().catch(() => null)
                                    }
                                    this.client.log.info(`Treating '${msg.content}' as public command '${command.data.title}'`, {
                                        svr_id: msg.guild.id,
                                        usr_id: msg.author.id
                                    })
                                    if (await command.checkPermissions(msg)) {
                                        await command.run(msg, Constants, {
                                            serverDocument,
                                            userDocument,
                                            memberDocument,
                                            channelDocument
                                        }, cmd.suffix).catch(err => {
                                            //Show debug information for maintainers 
                                            if (this.client.config.maintainers.includes(msg.author.id)) {
                                                this.client.log.warn(`Failed to execute command '${command.data.title}'`, {
                                                    svr_id: msg.guild.id,
                                                    usr_id: msg.author.id,
                                                    msg_id: msg.id
                                                }, err)
                                                msg.channel.send({
                                                    embed: {
                                                        color: Constants.Colors.ERROR,
                                                        title: `❌ Command Error:`,
                                                        description: `\`\`\`js\n${err.stack}\`\`\``
                                                    }
                                                })
                                            } else {
                                                if (err instanceof DiscordAPIError) {
                                                    //Handle Discord API errors (e.g missing permissions or can't send embed)
                                                    this.client.log.warn(`Failed to execute command '${command.data.title}' due to Discord API Error`, {
                                                        svr_id: msg.guild.id,
                                                        usr_id: msg.author.id,
                                                        msg_id: msg.id
                                                    }, err)
                                                    msg.channel.send({
                                                        embed: {
                                                            color: Constants.Colors.YELLOW,
                                                            title: `⚠️ Warning:`,
                                                            description: `An unexpected Discord error occurred.`
                                                        }
                                                    })
                                                } else {
                                                    //Handle more serious errors
                                                    this.client.log.error(`Failed to execute command '${command.data.title}'`, {
                                                        svr_id: msg.guild.id,
                                                        usr_id: msg.author.id,
                                                        msg_id: msg.id
                                                    }, err)
                                                    msg.channel.send({
                                                        embed: {
                                                            color: Constants.Colors.RED,
                                                            title: `❌ Error:`,
                                                            description: `Something went wrong!`,
                                                            footer: {
                                                                text: `The debug information has been sent to the maintainers.`
                                                            }
                                                        }
                                                    })
                                                }
                                            }
                                        })
                                    }
                                }
                            }
                        } else {
                            this.client.log.verbose(`Ignoring command handler for server-blocked user.`, {
                                msg_id: msg.id,
                                usr_id: msg.author.id,
                                svr_id: msg.guild.id,
                                ch_id: msg.channel.id
                            })
                        }
                    } else {
                        this.client.log.verbose(`Ignoring command handler in disabled channel.`, {
                            msg_id: msg.id,
                            usr_id: msg.author.id,
                            svr_id: msg.guild.id,
                            ch_id: msg.channel.id
                        })
                    }
                    await serverDocument.save()
                    await userDocument.save()
                } else {
                    this.client.log.error(`Could not find server document for ${msg.guild.name} for message`, {
                        svr_id: msg.guild.id,
                        serverDocument: serverDocument
                    })
                }
            }
        }
        timer.stop()
        this.client.log.verbose(`Successfully finished handling Discord message. Took ${Math.round(timer.duration / 2)}ms.`, {
            svr_id: `${msg.guild ? msg.guild.id : "DM"}`,
            ch_id: msg.channel.id,
            usr_id: msg.author.id
        })
    }
}