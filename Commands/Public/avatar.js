const moment = require("moment")
const { Command } = require("../../Structures")

module.exports = class AvatarCommand extends Command {
    constructor(client) {
        super(client, {
            title: "avatar",
            aliases: [`pfp`],
            description: "Displays a user's avatar.",
            usage: `<user>`,
            category: `utility`
        })
    }
    async run(msg, { 
        Colors,
        ImageURLOptions
    }, {}, suffix) {
        let member;
        if (!suffix || suffix.toLowerCase() == "me") {
            member = msg.member
        } else {
            member = msg.guild.findMember(suffix)
        }
        if (member) {
            await msg.channel.send({
                embed: {
                    author: {
                        name: `🎨 ${member.user.username}'s Avatar:`
                    },
                    color: member.embedColor,
                    image: {
                        url: member.user.avatarURL(ImageURLOptions)
                    }
                }
            })
        } else {
            await msg.channel.send({
                embed: {
                    color: Colors.SOFT_ERROR,
                    title: `❌ Error:`,
                    description: `I couldn't find that user.`
                }
            })
        }
    }
}