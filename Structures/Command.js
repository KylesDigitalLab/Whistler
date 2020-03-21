const { Constants } = require("../Internals")

module.exports = class Command {
    constructor(client, cmdData) {
        Object.defineProperty(this, `client`, {
            value: client,
            enumerable: false,
            writeable: false
        });
        if(!cmdData) {
            throw new Error(`Command data was not provided.`)
        } else {
            this.data = cmdData
        }
    }
    async checkPermissions(msg) {
        if(msg.guild) {
            if (this.data.permissions) {
                if (!msg.member.hasPermission(this.data.permissions)) {
                    await msg.channel.send({
                        embed: {
                            color: Constants.Colors.MISSING_PERMS,
                            title: `❌ Missing Permissions:`,
                            description: `Sorry, you don't have permission to run this command.`,
                        }
                    })
                    return false;
                }
                if (!msg.guild.me.hasPermission(this.data.permissions)) {
                    await msg.channel.send({
                        embed: {
                            color: Constants.Colors.MISSING_PERMS,
                            title: `❌ Missing Permissions:`,
                            description: `I don't have the required permissions to run this command!.`,
                            fields: [
                                {
                                    name: `Required Permissions:`,
                                    value: `\`${this.data.permissions.join(`, `)}\``
                                }
                            ],
                            footer: {
                                text: `Once I get these permissions, I'll be able to run this command.`
                            }
                        }
                    })
                    return false;
                }
            }
        }
        if (this.data.restricted && !this.client.config.maintainers.includes(msg.author.id)) {
            await msg.channel.send({
                embed: {
                    color: Constants.Colors.MISSING_PERMS,
                    title: `❌ Missing Permissions`,
                    description: `This command is restricted to **bot maintainers only**.`
                }
            })
            return false;
        }
        return true;
    }
}