const moment = require("moment")
const { Command } = require("./../Structures")

module.exports = class User extends Command {
    constructor(bot) {
        super(bot, {
            title: "user",
            aliases: [`userinfo`, `member`],
            description: "Shows information about a user.",
            category: `util`
        })
    }
    run = async (db, msg, serverData, userData, memberData, suffix) => {
        let member;
        if (!suffix || suffix.toLowerCase() == "me") {
            member = msg.member
        } else {
            member = this.bot.getMember(suffix, msg.guild)
            if(member) memberData = serverData.members.id(member.user.id)
            if (!memberData) {
                this.bot.log.debug(`Member data not found, creating now...`, {
                    usr_id: member.user.id,
                    svr_id: msg.guild.id
                })
                serverData.members.push({
                    _id: member.user.id
                })
                memberData = serverData.members.id(member.user.id)
            }
        }
        if (member) {
            let statusText;
            let user = member.user;
            switch (member.presence.status) {
                case `dnd`:
                    statusText = `🔴 Do Not Disturb`
                    break;
                case `online`:
                    statusText = `🟢 ${String.prototype.capitalize(member.presence.status)}`
                    break;
                case `idle`:
                    statusText = `🟡 ${String.prototype.capitalize(member.presence.status)}`
                    break;
                case `offline`:
                    statusText = `⚫ ${String.prototype.capitalize(member.presence.status)}`
                    break;
            }
            msg.channel.send({
                embed: {
                    color: this.bot.getEmbedColor(msg.guild),
                    title: `👤 User Information:`,
                    thumbnail: {
                        url: user.avatarURL()
                    },
                    fields: [
                        {
                            name: `#️⃣ Tag:`,
                            value: user.tag,
                            inline: true
                        },
                        {
                            name: `Nickname:`,
                            value: member.nickname || `No nickname.`,
                            inline: true
                        },
                        {
                            name: `🆔:`,
                            value: user.id,
                            inline: true
                        },
                        {
                            name: `🚦 Status:`,
                            value: `${statusText}`,
                            inline: true
                        },
                        {
                            name: `🎮 Game:`,
                            value: member.presence.activities.map(a => a.name).join(`, `) || `Nothing`,
                            inline: true
                        },
                        {
                            name: `💬 Messages:`,
                            value: memberData.message_count,
                            inline: true
                        },
                        {
                            name: `Last Active:`,
                            value: `${moment(memberData.last_active).format(serverData.config.date_format)} (${moment(memberData.last_active).fromNow()})`,
                            inline: true
                        },
                        {
                            name: `📆 Created:`,
                            value: `${moment(user.createdAt).format(serverData.config.date_format)} (${moment(user.createdAt).fromNow()})`,
                            inline: true
                        },
                        {
                            name: `🗓️ Joined:`,
                            value: `${moment(member.joinedAt).format(serverData.config.date_format)} (${moment(member.joinedAt).fromNow()})`,
                            inline: true
                        }
                    ], 
                    footer: {
                        text: `For more information on the user's game, use command 'status'.`
                    }
                }
            })
        } else {
            msg.channel.send({
                embed: {
                    color: this.bot.configJS.color_codes.RED,
                    title: `❌ Error:`,
                    description: `I couldn't find that user.`
                }
            })
        }
    }
}