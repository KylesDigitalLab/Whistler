const moment = require("moment")
const { Command } = require("../../Structures")

module.exports = class UserInfoCommand extends Command {
    constructor(client) {
        super(client, {
            title: "user",
            aliases: [`userinfo`, `member`],
            description: "Shows information about a user.",
            usage: `<user>`,
            category: `utility`
        })
    }
    async run(msg, { 
        Colors,
        ImageURLOptions,
        StatusText
    }, {
        serverDocument,
        memberDocument
    }, suffix) {
        let member;
        if (!suffix || suffix.toLowerCase() == "me") {
            member = msg.member
        } else {
            member = msg.guild.findMember(suffix)
            if(member) {
                memberDocument = member.document;
            }
        }
        if (member) {
            let user = member.user;
            await msg.channel.send({
                embed: {
                    color: member.embedColor,
                    title: `👤 User Information:`,
                    thumbnail: {
                        url: user.avatarURL(ImageURLOptions)
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
                            value: StatusText[member.presence.status],
                            inline: true
                        },
                        {
                            name: `🎮 Game:`,
                            value: member.presence.activities.map(a => a.name).join(`, `) || `Nothing`,
                            inline: true
                        },
                        {
                            name: `💬 Messages:`,
                            value: memberDocument.message_count,
                            inline: true
                        },
                        {
                            name: `Last Active:`,
                            value: `${msg.guild.formatDate(memberDocument.last_active)} (${moment(memberDocument.last_active).fromNow()})`,
                            inline: true
                        },
                        {
                            name: `📆 Created:`,
                            value: `${msg.guild.formatDate(user.createdAt)} (${moment(user.createdAt).fromNow()})`,
                            inline: true
                        },
                        {
                            name: `🗓️ Joined:`,
                            value: `${msg.guild.formatDate(user.joinedAt)} (${moment(member.joinedAt).fromNow()})`,
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
                    color: Colors.SOFT_ERROR,
                    title: `❌ Error:`,
                    description: `I couldn't find that user.`
                }
            })
        }
    }
}