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
        Colors 
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
                memberDocument = member.memberDocument;
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
                    statusText = `🟢 Online`
                    break;
                case `idle`:
                    statusText = `🟡 Idle`
                    break;
                case `offline`:
                    statusText = `⚫ Offline`
                    break;
            }
            msg.channel.send({
                embed: {
                    color: this.client.getEmbedColor(msg.guild),
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
                            value: memberDocument.message_count,
                            inline: true
                        },
                        {
                            name: `Last Active:`,
                            value: `${moment(memberDocument.last_active).format(serverDocument.config.date_format)} (${moment(memberDocument.last_active).fromNow()})`,
                            inline: true
                        },
                        {
                            name: `📆 Created:`,
                            value: `${moment(user.createdAt).format(serverDocument.config.date_format)} (${moment(user.createdAt).fromNow()})`,
                            inline: true
                        },
                        {
                            name: `🗓️ Joined:`,
                            value: `${moment(member.joinedAt).format(serverDocument.config.date_format)} (${moment(member.joinedAt).fromNow()})`,
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