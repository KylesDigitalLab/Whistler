const { Command } = require("../../Structures")
const { ModLog } = require("../../Modules")

module.exports = class KickCommand extends Command {
    constructor(client) {
        super(client, {
            title: `kick`,
            aliases: [],
            permissions: {
                bot: ["KICK_MEMBERS"],
                user: ["KICK_MEMBERS"]
            },
            description: "Kicks a member from the server.",
            usage: `<member> | <reason>`,
            category: `moderation`
        })
    }
    async run(msg, {
        Colors
    }, { }, suffix) {
        let member, reason;
        if (suffix) {
            if (suffix.indexOf("|") > -1 && suffix.length > 3) {
                member = msg.guild.findMember(suffix.substring(0, suffix.indexOf("|")).trim())
                reason = suffix.substring(suffix.indexOf("|") + 1).trim();
            } else {
                member = msg.guild.findMember(suffix)
                reason = `No reason was given.`
            }
            if (member) {
                if (member.kickable) {
                    await member.send({
                        embed: {
                            title: `👟 Notification`,
                            color: Colors.RED,
                            description: `Uh oh, it looks like you've been kicked from **${member.guild.name}**.`,
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
                        const kickedMember = await member.kick(`Member kicked by ${msg.author.tag} | ${reason}`)
                        this.client.log.info(`Kicked user ${kickedMember.user.tag} from server ${kickedMember.guild.name}`, {
                            svr_id: kickedMember.guild.id,
                            usr_id: kickedMember.user.id
                        })
                        await ModLog.createEntry(this.client, msg.guild, {
                            action: `Kick`,
                            user: member.user,
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
                                title: `👟 Member Kicked`,
                                description: `**${kickedMember.user.tag}** has been kicked from **${kickedMember.guild.name}**.`,
                                footer: {
                                    text: `They can still join again with an invite.`
                                }
                            }
                        })
                    } catch (err) {
                        this.client.log.error(`Failed to kick user ${member.user.tag} from server ${member.guild.name}`, {
                            svr_id: member.guild.id,
                            usr_id: member.user.id
                        }, err)
                        await msg.channel.send({
                            embed: {
                                color: Colors.ERROR,
                                title: `❌ Error:`,
                                description: `Uh oh. I couldn't kick that member.`
                            }
                        })
                    }
                } else {
                    await msg.channel.send({
                        embed: {
                            color: Colors.ERROR,
                            title: `❌ Error:`,
                            description: `Sorry, I can't kick that member.`,
                            footer: {
                                text: `Make sure I have permission to kick members.`
                            }
                        }
                    })
                }
            } else {
                await msg.channel.send({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        title: `⚠️ Warning:`,
                        description: `I don't know who that is, so I can't kick them.`
                    }
                })
            }
        } else {
            await msg.channel.send({
                embed: {
                    color: Colors.SOFT_ERROR,
                    title: `⚠️ Warning:`,
                    description: `Who do you want to kick?`
                }
            })
        }
    }
}