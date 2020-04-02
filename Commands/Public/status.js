const moment = require("moment")
const { Command } = require("../../Structures")

module.exports = class StatusCommand extends Command {
    constructor(client) {
        super(client, {
            title: "status",
            aliases: [`game`],
            description: "Shows information about a user.",
            usage: `<user>`,
            category: `utility`
        })
    }
    async run(msg, { 
        Colors 
    }, {
        serverDocument
    }, suffix) {
        let member;
        if (!suffix || suffix.toLowerCase() == "me") {
            member = msg.member
        } else {
            member = msg.guild.findMember(suffix)
        }
        if (member) {
            if (member.presence.activities.length) {
                member.presence.activities.forEach(async game => {
                    let embedFields = [
                        {
                            name: `Name:`,
                            value: game.name,
                            inline: true
                        }
                    ];
                    if (game.details) {
                        embedFields.push({
                            name: `Details:`,
                            value: game.details,
                            inline: true
                        })
                    }
                    if (game.state) {
                        embedFields.push({
                            name: `State:`,
                            value: game.state,
                            inline: true
                        })
                    }
                    if(game.assets) {
                        if(game.assets.largeText || game.assets.smallText) {
                            embedFields.push({
                                name: `Text:`,
                                value: game.assets.largeText || game.assets.smallText
                            })
                        }
                    }
                    if (game.timestamps) {
                        embedFields.push({
                            name: `Started:`,
                            value: moment(game.timestamps.start).format(serverDocument.config.date_format),
                            inline: true
                        })
                    }
                    await msg.channel.send({
                        embed: {
                            color: member.embedColor,
                            thumbnail: {
                                url: `${game.assets ? game.assets.largeImageURL() : member.user.avatarURL()}`
                            },
                            title: `🎮 Status Information:`,
                            fields: embedFields
                        }
                    })
                })
            } else {
                await msg.channel.send({
                    embed: {
                        color: member.embedColor,
                        description: `**${member.user.username}** isn't playing anything.`
                    }
                })
            }
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