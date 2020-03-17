const { Event } = require("../Structures")

module.exports = class MessageCreate extends Event {
    constructor(bot) {
        super(bot, {
            title: `message`,
            type: `Discord`
        })
    }
    run = async (db, msg) => {
        if (msg.author.id == this.bot.user.id) return;
        if (msg.channel.type == "dm") {
            this.bot.log.silly(`Received new direct message from ${msg.author.tag}:\r\n`, {
                usr_id: msg.author.id,
                msg_id: msg.id,
                msg_content: msg.content
            })
        } else {
            this.bot.log.silly(`New message sent by ${msg.author.tag} in ${msg.guild.name}\r\n`, {
                svr_id: msg.guild.id,
                usr_id: msg.author.id,
                msg_id: msg.id,
                msg_content: msg.content
            })
            const serverData = await db.servers.findOne({
                _id: msg.guild.id
            })
            let channelData = serverData.channels.id(msg.channel.id)
            if (!channelData) {
                this.bot.log.debug(`Channel data not found, creating now...\r\n`, {
                    ch_id: msg.channel.id,
                    svr_id: msg.guild.id
                })
                serverData.channels.push({
                    _id: msg.channel.id
                })
                channelData = serverData.channels.id(msg.channel.id)
            }

            let memberData = serverData.members.id(msg.author.id)
            if (!memberData) {
                this.bot.log.debug(`Member data not found, creating now...\r\n`, {
                    usr_id: msg.author.id,
                    svr_id: msg.guild.id
                })
                serverData.members.push({
                    _id: msg.author.id
                })
                memberData = serverData.members.id(msg.author.id)
            }
            memberData.last_active = Date.now()
            memberData.message_count++;
            const userData = await db.users.findOrCreate({
                _id: msg.author.id
            })
            userData.last_active = Date.now()
            let cmd = this.bot.commands.check(msg.content, serverData)
            if (cmd) {
                let command = this.bot.commands.all.get(cmd.command) || this.bot.commands.all.get(this.bot.commands.aliases.get(cmd.command))
                if (command) {
                    if (serverData.config.commands.delete_cmd_msg) {
                        try {
                            const m = await msg.delete();
                            this.bot.log.info(`Deleted message by ${msg.author.tag}`, {
                                msg_id: m.id,
                                svr_id: m.guild.id
                            })
                        } catch(_) {
                            //Eh
                        }
                    }
                    this.bot.log.info(`Treating '${msg.content}' as command '${command.info.title}'`, {
                        svr_id: msg.guild.id,
                        usr_id: msg.author.id
                    })
                    if (command.info.restricted && !this.bot.config.admin_ids.includes(msg.author.id)) {
                        this.bot.log.debug(`User attempted to run a command restricted to administrators`, {
                            usr_id: msg.author.id,
                            command_info: command.info.title,
                            svr_id: msg.guild.id
                        })
                        msg.channel.send({
                            embed: {
                                color: this.bot.configJS.color_codes.RED,
                                title: `⚠️ Restricted Command`,
                                description: `This command is restricted to bot administrators only and cannot be executed by regular users. Sorry!`
                            }
                        })
                    } else {
                        if (command.info.permissions && !msg.member.hasPermission(command.info.permissions)) {
                            msg.channel.send({
                                embed: {
                                    color: this.bot.configJS.color_codes.RED,
                                    title: `❌ Error:`,
                                    description: `Sorry, you don't have permission to run this command.`,
                                }
                            })
                        } else {
                            this.bot.log.info(`Executing command '${command.info.title}'...\r\n`, {
                                usr_id: msg.author.id,
                                svr_id: msg.guild.id
                            })
                            await command.run(db, msg, serverData, userData, memberData, cmd.suffix).catch(err => {
                                this.bot.log.error(`Failed to execute command '${command.info.title}'\r\n`, {
                                    svr_id: msg.guild.id,
                                    usr_id: msg.author.id,
                                    msg_id: msg.id
                                }, err)
                                msg.channel.send({
                                    embed: {
                                        color: this.bot.configJS.color_codes.RED,
                                        title: `❌ Error:`,
                                        description: `For an unknown reason, we failed to execute this command.`
                                    }
                                })
                            })
                        }
                    }
                }
            }
            await userData.save()
            this.bot.log.silly(`Successfully saved user data for ${msg.author.tag}\r\n`, {
                svr_id: msg.guild.id,
                usr_id: msg.author.id
            })
            await serverData.save()
            this.bot.log.silly(`Successfully saved server data for ${msg.guild.name}\r\n`, {
                svr_id: msg.guild.id
            })
        }
    }
}