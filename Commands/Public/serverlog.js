const { Command } = require("../../Structures")

module.exports = class ServerLogCommand extends Command {
    constructor(client) {
        super(client, {
            title: "serverlog",
            aliases: [],
            permissions: ["ADMINISTRATOR"],
            description: "Configures the server log.",
            usage: `<channel ID> OR disable`,
            category: `utility`
        })
    }
    async run(msg, { 
        Colors 
    }, {
        serverDocument
    }, suffix) {
        if (suffix) {
            if (suffix.trim().toLowerCase() == "disable") {
                serverDocument.config.log.enabled = false;
                await msg.channel.send({
                    embed: {
                        color: Colors.YELLOW,
                        title: `⚠️ Server Log Disabled`,
                        description: `The server log has been disabled.`
                    }
                })
            } else {
                const ch = msg.guild.findChannel(suffix)
                if (ch) {
                    if (ch.type == "text") {
                        let wasDisabled;
                        if (!serverDocument.config.log.enabled) {
                            wasDisabled = true;
                            serverDocument.config.log.enabled = true;
                        }
                        serverDocument.config.log.channel_id = ch.id;
                        await msg.channel.send({
                            embed: {
                                color: this.client.getEmbedColor(msg.guild),
                                title: `✅ Success!`,
                                description: `The server log has been ${wasDisabled ? "enabled and" : ""} set to ${ch.toString()}`
                            }
                        })
                    } else {
                        await msg.channel.send({
                            embed: {
                                color: Colors.ERROR,
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
                if(serverDocument.config.log.enabled) {
                    ch = await this.client.channels.fetch(serverDocument.config.log.channel_id)
                }
                await msg.channel.send({
                    embed: {
                        color: this.client.getEmbedColor(msg.guild),
                        title: `📜 Server Log Information:`,
                        description: `The server log is currently **${serverDocument.config.log.enabled ? `enabled** and set to ${ch.toString()}` : "disabled**"}.`
                    }
                })
            } catch(err) {
                this.client.log.warn(`Could not get log channel for ${msg.guild.name}:\r\n`, {
                    svr_id: msg.guild.id,
                    ch_id: serverDocument.config.log.channel_id
                },  err)
                await msg.channel.send({
                    embed: {
                        color: Colors.ERROR,
                        title: `❌ Invalid Log Channel:`,
                        description: `I couldn't get the log channel for this server.`,
                    }
                })
            }
        }
    }
}