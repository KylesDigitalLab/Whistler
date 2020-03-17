const { Command } = require("./../Structures")

module.exports = class Unban extends Command {
    constructor(bot) {
        super(bot, {
            title: `unban`,
            aliases: [],
            permissions: [`BAN_MEMBERS`],
            description: "Unbans a banned user from the server.",
            category: `mod`
        })
    }
    run = async (db, msg, serverData, userData, memberData, suffix) => {
        let member, reason;
        if(suffix) {
            if (suffix.indexOf("|") > -1 && suffix.length > 3) {
                member = suffix.substring(0, suffix.indexOf("|")).trim()
                reason = suffix.substring(suffix.indexOf("|") + 1).trim();
            } else {
                member = suffix;
                reason = `No reason was given.`
            }
            const bans = await msg.guild.fetchBans()
            const ban = bans.find(b => b.user.username.toLowerCase() == member.trim().toLowerCase() || b.user.id == member.trim())
            if(ban) {
                try {
                    const user = await msg.guild.members.unban(ban.user, `Unbanned by ${msg.author.tag} | ${reason}`)
                    this.bot.log.info(`Unbanned user ${user.tag} from ${msg.guild.name}`, {
                        usr_id: user.id,
                        svr_id: msg.guild.id
                    })
                    msg.channel.send({
                        embed: {
                            color: this.bot.getEmbedColor(msg.guild),
                            title: `🚪 User Unbanned`,
                            description: `**${user.tag}** has been unbanned from **${msg.guild.name}**`
                        }
                    })
                } catch (err) {
                    this.bot.log.error(`Failed to unban ${ban.user.tag} from ${msg.guild.name}`, {
                        usr_id: ban.user.id,
                        svr_id: msg.guild.id
                    }, err)
                    msg.channel.send({
                        embed: {
                            color: this.bot.color_codes.RED,
                            title: `❌ Error:`,
                            description: `I couldn't unban **${ban.user.tag}** from the server.`
                        }
                    })
                }
            } else {
                msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.YELLOW,
                        description: `I couldn't find that user in the ban list.`
                    }
                })
            }
        } else {
            msg.channel.send({
                embed: {
                    color: this.bot.configJS.color_codes.YELLOW,
                    description: `I need a banned user to unban.`
                }
            })
        }
    }
}