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
    run = async(db, msg, serverData, userData, memberData, suffix) => {
        if(suffix) {
            userData.location = suffix.trim();
            msg.channel.send({
                embed: {
                    color: this.bot.getEmbedColor(msg.guild),
                    description: `OK, I've set your location to **${suffix.trim()}**.`
                }
            })
        } else {
            if(userData.location) {
                msg.channel.send({
                    embed: {
                        color: this.bot.getEmbedColor(msg.guild),
                        description: `Your location is **${userData.location}**.`
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