const { Command } = require("./../Structures")

module.exports = class Ban extends Command {
    constructor(bot) {
        super(bot, {
            title: `ban`,
            aliases: [],
            permissions: ["BAN_MEMBERS"],
            description: "Bans a member from the server.",
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
                if (member.bannable) {
                    await msg.channel.send({
                        embed: {
                            color: this.bot.getEmbedColor(msg.guild),
                            title: `⚠️ Confirm Ban:`,
                            description: `Are you **sure** you want to ban **${member.user.tag}**?`,
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
                            if (this.bot.configJS.yes_strings.includes(m.content.toLowerCase().trim())) {
                                try {
                                    await member.send({
                                        embed: {
                                            title: `🔨 Notification`,
                                            color: this.bot.configJS.color_codes.RED,
                                            description: `Uh oh, it looks like you've been banned from **${member.guild.name}**.`,
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
                                } catch(_) {
                                    //Eh
                                }
                                try {
                                    const bannedMember = await member.ban({
                                        reason: `Member banned by ${msg.author.tag} | ${reason}`
                                    })
                                    this.bot.log.info(`Banned user ${bannedMember.user.tag} from server ${bannedMember.guild.name}`, {
                                        svr_id: bannedMember.guild.id,
                                        usr_id: bannedMember.user.id
                                    })
                                    msg.channel.send({
                                        embed: {
                                            color: this.bot.configJS.color_codes.GREEN,
                                            title: `🔨 Member Banned`,
                                            description: `**${bannedMember.user.tag}** has been banned from **${bannedMember.guild.name}**.`
                                        }
                                    })
                                } catch (err) {
                                    this.bot.log.error(`Failed to ban user ${member.user.tag} from server ${member.guild.name}`, {
                                        svr_id: member.guild.id,
                                        usr_id: member.user.id
                                    }, err)
                                    msg.channel.send({
                                        embed: {
                                            color: this.bot.configJS.color_codes.RED,
                                            title: `❌ Error:`,
                                            description: `Uh oh. I couldn't ban that member.`
                                        }
                                    })
                                }
                            } else {
                                msg.channel.send({
                                    embed: {
                                        color: this.bot.configJS.color_codes.YELLOW,
                                        title: `⚠️ Ban Cancelled:`,
                                        description: `**${member.user.tag}** will **not** be banned.`
                                    }
                                })
                            }
                        }
                    })
                } else {
                    msg.channel.send({
                        embed: {
                            color: this.bot.configJS.color_codes.RED,
                            title: `❌ Error:`,
                            description: `Sorry, I can't ban that member.`,
                            footer: {
                                text: `Make sure I have permission to ban members.`
                            }
                        }
                    })
                }
            } else {
                msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.YELLOW,
                        title: `⚠️ Warning:`,
                        description: `I don't know who that is, so I can't ban them.`
                    }
                })
            }
        } else {
            msg.channel.send({
                embed: {
                    color: this.bot.configJS.color_codes.YELLOW,
                    title: `⚠️ Warning:`,
                    description: `Who do you want to ban?`
                }
            })
        }
    }
}