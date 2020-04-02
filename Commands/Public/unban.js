const { Command } = require("../../Structures")
const { ModLog } = require("../../Modules")

module.exports = class UnbanCommand extends Command {
    constructor(client) {
        super(client, {
            title: `unban`,
            aliases: [],
            permissions: {
                bot: ["BAN_MEMBERS"],
                user: ["BAN_MEMBERS"]
            },
            description: "Unbans a banned user from the server.",
            usage: `<user> | <reason>`,
            category: `moderation`
        })
    }
    async run(msg, { 
        Colors 
    }, {}, suffix) {
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
                    this.client.log.info(`Unbanned user ${user.tag} from ${msg.guild.name}`, {
                        usr_id: user.id,
                        svr_id: msg.guild.id
                    })
                    await ModLog.createEntry(this.client, msg.guild, {
                        action: `Unban`,
                        user: user,
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
                            color: this.client.getEmbedColor(msg.guild),
                            title: `🚪 User Unbanned`,
                            description: `**${user.tag}** has been unbanned from **${msg.guild.name}**`
                        }
                    })
                } catch (err) {
                    this.client.log.error(`Failed to unban ${ban.user.tag} from ${msg.guild.name}`, {
                        usr_id: ban.user.id,
                        svr_id: msg.guild.id
                    }, err)
                    await msg.channel.send({
                        embed: {
                            color: Colors.ERROR,
                            title: `❌ Error:`,
                            description: `I couldn't unban **${ban.user.tag}** from the server.`
                        }
                    })
                }
            } else {
                await msg.channel.send({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        description: `I couldn't find that user in the ban list.`
                    }
                })
            }
        } else {
            await msg.channel.send({
                embed: {
                    color: Colors.SOFT_ERROR,
                    description: `I need a banned user to unban.`
                }
            })
        }
    }
}