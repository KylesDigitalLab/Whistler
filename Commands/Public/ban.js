const { Command } = require("../../Structures")
const { ModLog } = require("../../Modules")
const { GuildMember, User } = require("discord.js")

module.exports = class BanCommand extends Command {
    constructor(client) {
        super(client, {
            title: `ban`,
            aliases: [],
            permissions: {
                bot: ["BAN_MEMBERS"],
                user: ["BAN_MEMBERS"]
            },
            description: "Bans a member from the server.",
            category: `moderation`
        })
    }
    async run(msg, {
        Colors
    }, {
        serverDocument
    }, suffix) {
        let member, reason;
        if (suffix) {
            let str = suffix.substring(0, suffix.indexOf("|")).trim();
            if (suffix.indexOf("|") > -1 && suffix.length > 3) {
                member = msg.guild.findMember(str);
                reason = suffix.substring(suffix.indexOf("|") + 1).trim();
            } else {
                member = msg.guild.findMember(suffix)
                reason = `No reason was given.`
            }
            if (!member) {
                if (suffix.indexOf("|") > -1 && suffix.length > 3) {
                    member = await this.client.users.fetch(str).catch(() => member = null)
                    reason = suffix.substring(suffix.indexOf("|") + 1).trim();
                } else {
                    member = await this.client.users.fetch(suffix).catch(() => member = null)
                    reason = `No reason was given.`
                }
            }
            if (member) {
                let tag = `${!member instanceof GuildMember ? member.user.username : member.username}#${!member instanceof GuildMember ? member.user.discriminator : member.discriminator}`
                if (!member.user || member.bannable) {
                    await msg.channel.send({
                        embed: {
                            color: Colors.WARNING,
                            title: `⚠️ Confirm Ban:`,
                            description: `Are you **sure** you want to ${member instanceof GuildMember ? "" : "hackban"}ban **${member instanceof GuildMember ? member.user.tag : tag}**?`,
                            footer: {
                                text: `Respond with a 'yes' or 'no'`
                            }
                        }
                    })
                    const collector = msg.channel.createMessageCollector(m => m.author.id == msg.author.id, {
                        time: 10000
                    })
                    collector.on(`collect`, async m => {
                        if (m.content) {
                            collector.stop();
                            if (this.client.configJS.yes_strings.includes(m.content.toLowerCase().trim())) {
                                await member.send({
                                    embed: {
                                        title: `🔨 Notification`,
                                        color: Colors.RED,
                                        description: `Uh oh, it looks like you've been banned from **${msg.guild.name}**.`,
                                        fields: [
                                            {
                                                name: `Reason:`,
                                                value: reason,
                                                inline: true
                                            },
                                            {
                                                name: `Moderator:`,
                                                value: msg.author.tag,
                                                inline: true
                                            }
                                        ]
                                    }
                                }).catch(() => null)
                                try {
                                    const ban = await msg.guild.members.ban(member, {
                                        reason: `Member banned by ${msg.author.tag} | ${reason}`
                                    })
                                    this.client.log.info(`Banned user ${member instanceof GuildMember ? ban.user.tag : tag} from server ${msg.guild.name}`, {
                                        svr_id: msg.guild.id,
                                        usr_id: member instanceof GuildMember ? ban.user.id : ban.id || ban
                                    })
                                    await ModLog.createEntry(this.client, msg.guild, {
                                        action: `Ban`,
                                        user: member instanceof GuildMember ? member.user : member,
                                        moderator: msg.author,
                                        reason: reason
                                    }).catch(err => {
                                        this.client.log.warn(`Failed to create modlog entry`, {
                                            svr_id: msg.guild.id,
                                            usr_id: msg.author.id
                                        }, err)
                                    })
                                    await msg.channel.send({
                                        embed: {
                                            color: Colors.GREEN,
                                            title: `🔨 Member Banned`,
                                            description: `**${member instanceof GuildMember ? ban.user.tag : tag}** has been banned from **${msg.guild.name}**.`
                                        }
                                    })
                                } catch (err) {
                                    this.client.log.error(`Failed to ban user ${member instanceof GuildMember ? member.user.tag : tag} from server ${msg.guild.name}`, {
                                        svr_id: msg.guild.id,
                                        usr_id: member instanceof GuildMember ? member.user.id : member.id,
                                    }, err)
                                    await msg.channel.send({
                                        embed: {
                                            color: Colors.ERROR,
                                            title: `❌ Error:`,
                                            description: `Uh oh. I couldn't ban that member.`
                                        }
                                    })
                                }
                            } else {
                                await msg.channel.send({
                                    embed: {
                                        color: Colors.YELLOW,
                                        title: `⚠️ Ban Cancelled:`,
                                        description: `**${member instanceof GuildMember ? member.user.tag : tag}** will **not** be banned.`
                                    }
                                })
                            }
                        }
                    })
                } else {
                    await msg.channel.send({
                        embed: {
                            color: Colors.ERROR,
                            title: `❌ Error:`,
                            description: `Sorry, I can't ban that member.`,
                            footer: {
                                text: `Make sure I have permission to ban members.`
                            }
                        }
                    })
                }
            } else {
                await msg.channel.send({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        title: `⚠️ Warning:`,
                        description: `I don't know who that is, so I can't ban them.`
                    }
                })
            }
        } else {
            await msg.channel.send({
                embed: {
                    color: Colors.SOFT_ERROR,
                    title: `⚠️ Warning:`,
                    description: `Who do you want to ban?`
                }
            })
        }
    }
}