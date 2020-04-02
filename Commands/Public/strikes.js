const moment = require("moment")
const { Command } = require("../../Structures")
const PaginatedEmbed = require("../../Modules/MessageUtils/PaginatedEmbed");

module.exports = class StrikesCommand extends Command {
    constructor(client) {
        super(client, {
            title: "strikes",
            aliases: [],
            description: "Displays strikes for a user.",
            usage: `<user>`,
            category: `moderation`
        })
    }
    async run(msg, {
        Colors
    }, { }, suffix) {
        let member, me;
        if (!suffix || suffix.toLowerCase() == "me") {
            me = true;
            member = msg.member
        } else {
            me = false;
            member = msg.guild.findMember(suffix)
        }
        if (member) {
            const memberDocument = member.document;
            if (!memberDocument.strikes.length) {
                await msg.channel.send({
                    embed: {
                        color: Colors.GREEN,
                        title: `✅ No Strikes!`,
                        description: `${me ? "You don't" : `**${member.user.tag}** doesn't`} have any strikes.`
                    }
                })
            } else {
                let [timestamps, fields] = [[], []]
                for(const strike of memberDocument.strikes) {
                    let admin = msg.guild.members.cache.get(strike.admin_id)
                    timestamps.push(strike.timestamp)
                    fields.push([{
                        name: `Reason:`,
                        value: `\`${strike.reason}\``,
                        inline: true
                    }, {
                        name: `Moderator:`,
                        value: `${admin ? `${admin.user.tag}` : "INVALID"}`,
                        inline: true
                    }, {
                        name: `ID:`,
                        value: strike.id
                    }])
                }
                await new PaginatedEmbed(this.client, msg, {
                    title: `🌩️ Strikes for ${member.user.tag}:`,
                    description: `${member.user.username} has **${memberDocument.strikes.length}** strike${memberDocument.strikes.length == "1" ? "" : "s"}.`,
                    color: Colors.WARNING,
                    footer: `Strike {currentPage} out of {totalPages}`
                }, {
                    fields,
                    timestamps,
                    pageCount: memberDocument.strikes.length
                }).init()
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