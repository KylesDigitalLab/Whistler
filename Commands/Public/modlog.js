const { Command } = require("../../Structures")

module.exports = class ModLogCommand extends Command {
    constructor(client) {
        super(client, {
            title: "modlog",
            aliases: [],
            permissions: {
                bot: [],
                user: ["MANAGE_GUILD"]
            },
            description: "Configures the moderation log.",
            usage: `<channel ID> OR disable`,
            category: `moderation`
        })
    }
    async run(msg, { 
        Colors 
    }, {
        serverDocument
    }, suffix) {
        if (suffix) {
            if (suffix.trim().toLowerCase() == "disable") {
                serverDocument.config.moderation.log.enabled = false;
                await msg.channel.send({
                    embed: {
                        color: Colors.YELLOW,
                        title: `⚠️ Moderation Log Disabled`,
                        description: `The moderation log has been disabled.`
                    }
                })
            } else {
                const ch = msg.guild.findChannel(suffix)
                if (ch) {
                    if (ch.type == "text") {
                        let wasDisabled = false;
                        if (!serverDocument.config.moderation.log.enabled) {
                            wasDisabled = true;
                            serverDocument.config.moderation.log.enabled = true;
                        }
                        serverDocument.config.moderation.log.channel_id = ch.id;
                        await msg.channel.send({
                            embed: {
                                color: this.client.getEmbedColor(msg.guild),
                                title: `✅ Success!`,
                                description: `The moderation log has been ${wasDisabled ? "enabled and" : ""} set to ${ch.toString()}`
                            }
                        })
                    } else {
                        await msg.channel.send({
                            embed: {
                                color: Colors.SOFT_ERROR,
                                title: `❌ Error:`,
                                description: `**${ch.name}** is a **${ch.type}** channel!`,
                                footer: {
                                    text: `I need a text channel.`
                                }
                            }
                        })
                    }
                } else {
                    await msg.channel.send({
                        embed: {
                            color: Colors.ERROR,
                            title: `❌ Error:`,
                            description: `I couldn't find that channel on this server.`,
                            footer: {
                                text: `I need a text channel ID.`
                            }
                        }
                    })
                }
            }
        } else {
            try {
                let ch;
                if(serverDocument.config.moderation.log.enabled) {
                    ch = await this.client.channels.fetch(serverDocument.config.moderation.log.channel_id)
                }
                await msg.channel.send({
                    embed: {
                        color: this.client.getEmbedColor(msg.guild),
                        title: `📜 Moderation Log Information:`,
                        description: `The moderation log is currently **${serverDocument.config.moderation.log.enabled ? `enabled** and set to ${ch.toString()}` : "disabled**"}.`
                    }
                })
            } catch(err) {
                this.client.log.warn(`Could not get modlog channel for ${msg.guild.name}`, {
                    svr_id: msg.guild.id,
                    ch_id: serverDocument.config.moderation.log.channel_id
                },  err)
                await msg.channel.send({
                    embed: {
                        color: Colors.ERROR,
                        title: `❌ Invalid Log Channel:`,
                        description: `I couldn't get the modlog channel for this server.`,
                    }
                })
            }
        }
    }
}