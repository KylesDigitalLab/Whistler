const { Command } = require("../../Structures")
const { ModLog } = require("../../Modules")

module.exports = class StrikeCommand extends Command {
    constructor(client) {
        super(client, {
            title: `strike`,
            aliases: [],
            permissions: {
                bot: [],
                user: ["KICK_MEMBERS"]
            },
            description: "Strikes a user for rule violations.",
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
            if (suffix.indexOf("|") > -1 && suffix.length > 3) {
                member = msg.guild.findMember(suffix.substring(0, suffix.indexOf("|")).trim());
                reason = suffix.substring(suffix.indexOf("|") + 1).trim();
            } else {
                member = msg.guild.findMember(suffix)
                reason = `No reason was given.`
            }
            if (member) {
                if(member.user.bot || member.user.id == msg.author.id) {
                    return await msg.channel.send({
                        embed: {
                            color: Colors.SOFT_ERROR,
                            title: `⚠️ Warning:`,
                            description: `You cannot strike this user!`
                        }
                    })
                }
                const memberDocument = member.document;
                memberDocument.strikes.push({
                    admin_id: msg.author.id,
                    reason: reason,
                    timestamp: Date.now()
                })
                let warned;
                try {  
                    const DM = await member.user.createDM();
                    await DM.send({
                        embed: {
                            color: Colors.WARNING,
                            title: `🌩️ You've just received a strike!`,
                            description: `You've just been striked on **${msg.guild.name}**. You now have **${memberDocument.strikes.length}** strike${memberDocument.strikes.length == 1 ? "" : "s"}.`,
                            fields: [
                                {
                                    name: `Reason:`,
                                    value: `\`${reason}\``,
                                    inline: true
                                },
                                {
                                    name: `Moderator:`,
                                    value: `${msg.author.tag}`,
                                    inline: true
                                }
                            ]
                        }
                    })
                    warned = true;
                } catch (_) {
                    warned = false;
                }
                await ModLog.createEntry(this.client, msg.guild, {
                    action: `Strike`,
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
                        title: `🌩️ Success:`,
                        description: `**${member.user.tag}** has been **striked**. They now have **${memberDocument.strikes.length}** strike${memberDocument.strikes.length == 1 ? "" : "s"}.`,
                        footer: {
                            text: `I ${warned ? "warned" : "tried to warn"} them via DM${warned ? "." : ", but something went wrong."}`
                        }
                    }
                })
            } else {
                await msg.channel.send({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        title: `⚠️ Warning:`,
                        description: `I don't know who that is, so I can't strike them.`
                    }
                })
            }
        } else {
            await msg.channel.send({
                embed: {
                    color: Colors.SOFT_ERROR,
                    title: `⚠️ Warning:`,
                    description: `Who do you want to strike?`
                }
            })
        }
    }
}