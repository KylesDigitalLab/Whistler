const { Command } = require("./../Structures")

module.exports = class ServerLogCommand extends Command {
    constructor(bot) {
        super(bot, {
            title: "serverlog",
            aliases: [],
            permissions: ["ADMINISTRATOR"],
            description: "Configures the server log.",
            category: `util`
        })
    }
    run = async (db, msg, serverDocument, userDocument, memberDocument, suffix) => {
        if (suffix) {
            if (suffix.trim().toLowerCase() == "disable") {
                serverDocument.config.log.enabled = false;
                await msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.YELLOW,
                        title: `⚠️ Server Log Disabled`,
                        description: `The server log has been disabled.`
                    }
                })
            } else {
                const ch = this.bot.findChannel(suffix, msg.guild)
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
                                color: this.bot.getEmbedColor(msg.guild),
                                title: `✅ Success!`,
                                description: `The server log has been ${wasDisabled ? "enabled and" : ""} set to ${ch.toString()}`
                            }
                        })
                    } else {
                        await msg.channel.send({
                            embed: {
                                color: this.bot.configJS.color_codes.RED,
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
                            color: this.bot.configJS.color_codes.RED,
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
                    ch = await this.bot.channels.fetch(serverDocument.config.log.channel_id)
                }
                await msg.channel.send({
                    embed: {
                        color: this.bot.getEmbedColor(msg.guild),
                        title: `📜 Server Log Information:`,
                        description: `The server log is currently **${serverDocument.config.log.enabled ? `enabled** and set to ${ch.toString()}` : "disabled**"}.`
                    }
                })
            } catch(err) {
                this.bot.log.warn(`Could not get log channel for ${msg.guild.name}:\r\n`, {
                    svr_id: msg.guild.id,
                    ch_id: serverDocument.config.log.channel_id
                },  err)
                await msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.RED,
                        title: `❌ Invalid Log Channel:`,
                        description: `I couldn't get the log channel for this server.`,
                    }
                })
            }
        }
    }
}