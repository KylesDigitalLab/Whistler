const { Command } = require("../../Structures")

module.exports = class LocationCommand extends Command {
    constructor(client) {
        super(client, {
            title: "location",
            aliases: [],
            description: "Set's a user's location",
            category: `media`
        })
    }
    async run(msg, {
        Colors
    }, {
        userDocument
    }, suffix) {
        if (suffix) {
            userDocument.location = suffix.trim();
            msg.channel.send({
                embed: {
                    color: this.client.getEmbedColor(msg.guild),
                    description: `OK, I've set your location to **${suffix.trim()}**.`
                }
            })
        } else {
            if (userDocument.location) {
                msg.channel.send({
                    embed: {
                        color: this.client.getEmbedColor(msg.guild),
                        description: `Your location is **${userDocument.location}**.`
                    }
                })
            } else {
                msg.channel.send({
                    embed: {
                        color: this.client.getEmbedColor(msg.guild),
                        description: `You don't have a location set.`
                    }
                })
            }
        }
    }
}