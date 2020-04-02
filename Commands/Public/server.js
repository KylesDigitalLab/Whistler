const { Command } = require("../../Structures")
const moment = require("moment")
const { GetFlagForRegion } = require("../../Modules/Utils")

module.exports = class ServerCommand extends Command {
    constructor(client) {
        super(client, {
            title: "server",
            aliases: ["serverinfo", "guild"],
            description: "Shows information about the current server the user is in.",
            category: `utility`
        })
    }
    async run(msg, { 
        Colors,
        ImageURLOptions,
        GUILD_VERIFICATION_LEVELS,
        EXPLICIT_CONTENT_FILTER_LEVELS
    }, {
        serverDocument
    }, suffix) {
        let svr = msg.guild;
        let [userCount, botCount] = [svr.members.cache.filter(m => !m.user.bot).size, svr.members.cache.filter(m => m.user.bot).size]
        this.s = num => num == 1 ? `` : `s`
        await msg.channel.send({
            embed: {
                color: this.client.getEmbedColor(msg.guild),
                title: `Information about ${svr.name}:`,
                thumbnail: {
                    url: svr.iconURL(ImageURLOptions)
                },
                fields: [
                    {
                        name: `🆔:`,
                        value: svr.id,
                        inline: true
                    },
                    {
                        name: `🔐 Owner:`,
                        value: `${svr.owner.user.tag}`,
                        inline: true
                    },
                    {
                        name: `🌐 Region:`,
                        value: `${GetFlagForRegion(svr.region)} ${svr.region}`,
                        inline: true
                    },
                    {
                        name: `👥 Members:`,
                        value: `${userCount} user${this.s(userCount)}, ${botCount} bot${this.s(botCount)}
                        (${svr.memberCount} total)`,
                        inline: true
                    },
                    {
                        name: `Roles:`,
                        value: `${svr.roles.cache.size} role${this.s(svr.roles.cache.size)}`,
                        inline: true
                    },
                    {
                        name: `#️⃣  Channels:`,
                        value: `**${svr.channels.cache.filter(c => c.type == "text").size}** text
                        **${svr.channels.cache.filter(c => c.type == "voice").size}** voice
                        **${svr.channels.cache.filter(c => c.type == "category").size}** categories
                        **${svr.channels.cache.size}** total`,
                        inline: true
                    },
                    {
                        name: `Emojis:`,
                        value: `${svr.emojis.cache.size} custom emoji${this.s(svr.emojis.cache.size)}`,
                        inline: true
                    },
                    {
                        name: `✅ Verification Level:`,
                        value: `${GUILD_VERIFICATION_LEVELS[svr.verificationLevel]}`,
                        inline: true
                    },
                    {
                        name: `🧼 Explicit Content Filter:`,
                        value: `${EXPLICIT_CONTENT_FILTER_LEVELS[svr.explicitContentFilter]}`,
                        inline: true
                    },
                    {
                        name: `🗓️ Created:`,
                        value: `${svr.formatDate(svr.createdAt)} (${moment(svr.createdAt).fromNow()})`,
                        inline: true
                    }
                ],
                footer: {
                    text: `This server is on shard ${msg.guild.shard.id}.`
                }
            }
        })
    }
}
