const { Command } = require("./../Structures")

module.exports = class Kick extends Command {
    constructor(bot) {
        super(bot, {
            title: `kick`,
            aliases: [],
            permissions: ["KICK_MEMBERS"],
            description: "Kicks a member from the server.",
            category: `mod`
        })
    }
    run = async (db, msg, serverData, userData, memberData, suffix) => {
        let member, reason;
        if (suffix) {
            if (suffix.indexOf("|") > -1 && suffix.length > 3) {
                member = this.bot.getMember(suffix.substring(0, suffix.indexOf("|")).trim(), msg.guild);
                reason = suffix.substring(suffix.indexOf("|") + 1).trim();
            } else {
                member = this.bot.getMember(suffix, msg.guild);
                reason = `No reason was given.`
            }
            if (member) {
                if (member.kickable) {
                    try {
                        await member.send({
                            embed: {
                                title: `👟 Notification`,
                                color: this.bot.configJS.color_codes.RED,
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
                        })
                    } catch (_) {
                        //Eh
                    }
                    try {
                        const kickedMember = await member.kick(`Member kicked by ${msg.author.tag} | ${reason}`)
                        this.bot.log.info(`Kicked user ${kickedMember.user.tag} from server ${kickedMember.guild.name}`, {
                            svr_id: kickedMember.guild.id,
                            usr_id: kickedMember.user.id
                        })
                        msg.channel.send({
                            embed: {
                                color: this.bot.configJS.color_codes.GREEN,
                                title: `👟 Member Kicked`,
                                description: `**${kickedMember.user.tag}** has been kicked from **${kickedMember.guild.name}**.`,
                                footer: {
                                    text: `They can still join again with an invite.`
                                }
                            }
                        })
                    } catch (err) {
                        this.bot.log.error(`Failed to kick user ${member.user.tag} from server ${member.guild.name}`, {
                            svr_id: member.guild.id,
                            usr_id: member.user.id
                        }, err)
                        msg.channel.send({
                            embed: {
                                color: this.bot.configJS.color_codes.RED,
                                title: `❌ Error:`,
                                description: `Uh oh. I couldn't kick that member.`
                            }
                        })
                    }
                } else {
                    msg.channel.send({
                        embed: {
                            color: this.bot.configJS.color_codes.RED,
                            title: `❌ Error:`,
                            description: `Sorry, I can't kick that member.`,
                            footer: {
                                text: `Make sure I have permission to kick members.`
                            }
                        }
                    })
                }
            } else {
                msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.YELLOW,
                        title: `⚠️ Warning:`,
                        description: `I don't know who that is, so I can't kick them.`
                    }
                })
            }
        } else {
            msg.channel.send({
                embed: {
                    color: this.bot.configJS.color_codes.YELLOW,
                    title: `⚠️ Warning:`,
                    description: `Who do you want to kick?`
                }
            })
        }
    }
}