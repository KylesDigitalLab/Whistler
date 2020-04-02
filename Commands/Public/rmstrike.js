const { Command } = require("../../Structures")
const { ModLog } = require("../../Modules")

module.exports = class RMStrikeCommand extends Command {
    constructor(client) {
        super(client, {
            title: "rmstrike",
            aliases: [],
            permissions: {
                bot: [],
                user: ["KICK_MEMBERS"]
            },
            description: "Removes a strike by it's ID.",
            usage: `<strike ID>`,
            category: `moderation`
        })
    }
    async run(msg, {
        Colors
    }, {
        serverDocument
    }, suffix) {
        if (suffix) {
            suffix = suffix.trim()
            let memberDocument = serverDocument.members.find(m => m.strikes.id(suffix));
            if (memberDocument) {
                let member = msg.guild.members.cache.get(memberDocument._id)
                let strike = memberDocument.strikes.id(suffix)
                if (member) {
                    memberDocument.strikes.remove(strike._id)
                    await ModLog.createEntry(this.client, msg.guild, {
                        action: `Unstrike`,
                        user: member.user,
                        moderator: msg.author,
                        reason: `No reason`
                    }).catch(err => {
                        this.client.log.warn(`Failed to create modlog entry`, {
                            svr_id: msg.guild.id,
                            usr_id: msg.author.id
                        }, err)
                    })
                    await msg.channel.send({
                        embed: {
                            color: Colors.SUCCESS,
                            title: `✅ Strike Removed!`,
                            description: `I've removed **${member.user.tag}**'s strike. They now have **${memberDocument.strikes.length}** strike${memberDocument.strikes.length == 1 ? "" : "s"}.`,
                            fields: [{
                                name: `Reason:`,
                                value: `\`${strike.reason}\``,
                                inline: true
                            }, {
                                name: `Moderator:`,
                                value: `${msg.guild.members.cache.get(strike.admin_id) ? `${msg.guild.members.cache.get(strike.admin_id).user.tag}` : "INVALID"}`,
                                inline: true
                            }]
                        }
                    })
                } else {
                    await msg.channel.send({
                        embed: {
                            color: Colors.ERROR,
                            title: `❌ Error:`,
                            description: `I found that strike, but couldn't find the associated member.`,
                            footer: {
                                text: `User ID: ${memberDocument._id}`
                            }
                        }
                    })
                }
            } else {
                await msg.channel.send({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        title: `❌ Error:`,
                        description: `I couldn't find any information on that strike.`,
                        footer: {
                            text: `I need a strike ID, not a user ID.`
                        }
                    }
                })
            }
        }
    }
}