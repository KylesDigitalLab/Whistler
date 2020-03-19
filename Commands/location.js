const { Command } = require("./../Structures")

module.exports = class Location extends Command {
    constructor(bot) {
        super(bot, {
            title: "location",
            aliases: [],
            description: "Set's a user's location",
            category: `util`
        })
    }
    run = async(db, msg, serverDocument, userDocument, memberDocument, suffix) => {
        if(suffix) {
            userDocument.location = suffix.trim();
            msg.channel.send({
                embed: {
                    color: this.bot.getEmbedColor(msg.guild),
                    description: `OK, I've set your location to **${suffix.trim()}**.`
                }
            })
        } else {
            if(userDocument.location) {
                msg.channel.send({
                    embed: {
                        color: this.bot.getEmbedColor(msg.guild),
                        description: `Your location is **${userDocument.location}**.`
                    }
                })
            } else {
                msg.channel.send({
                    embed: {
                        color: this.bot.getEmbedColor(msg.guild),
                        description: `You don't have a location set.`
                    }
                })
            }
        }
    }
}