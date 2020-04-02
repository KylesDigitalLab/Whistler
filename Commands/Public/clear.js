const { Command } = require("../../Structures")

module.exports = class ClearCommand extends Command {
    constructor(client) {
        super(client, {
            title: `clear`,
            aliases: [`nuke`],
            permissions: {
                bot: ["MANAGE_MESSAGES"],
                user: ["MANAGE_MESSAGES"]
            },
            description: "Bulk deletes a number of messages.",
            usage: `<num>`,
            category: `moderation`
        })
    }
    async run(msg, {
        Colors,
        Utils
    }, { }, suffix) {
        if (suffix) {
            let num = parseInt(suffix.trim())
            if (!isNaN(num)) {
                try {
                    const deleted = await msg.channel.bulkDelete(num)
                    const m = await msg.channel.send({
                        embed: {
                            color: Colors.GREEN,
                            title: `🗑️ Success!`,
                            description: `Deleted ${deleted.size} messages in ${msg.channel.toString()}`
                        }
                    })
                    await Utils.wait(3000)
                    await m.delete().catch(() => null)
                } catch(err) {
                    this.client.log.error(`Failed to bulk delete messages`, {
                        svr_id: svr.id,
                        ch_id: msg.channel.id
                    }, err)
                    await msg.channel.send({
                        embed: {
                            color: Colors.GREEN,
                            title: `❌ Error:`,
                            description: `I couldn't delete those messages.`
                        }
                    })
                }
            } else {
                await msg.channel.send({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        title: `❌ Error:`,
                        description: `That's not a valid number.`
                    }
                })
            }
        } else {
            await msg.channel.send({
                embed: {
                    color: Colors.SOFT_ERROR,
                    title: `⁉️ Error:`,
                    description: `How many messages to delete?`
                }
            })
        }
    }
}