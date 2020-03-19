module.exports = class Command {
    constructor(bot, cmdData) {
        Object.defineProperty(this, `bot`, {
            value: bot,
            enumerable: false,
            writeable: false
        });
        if(!cmdData) {
            throw new Error(`Command data was not provided.`)
        } else {
            this.info = cmdData
        }
    }
    checkPermissions = async msg => {
        if (this.info.permissions) {
            if (!msg.member.hasPermission(this.info.permissions)) {
                await msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.RED,
                        title: `❌ Missing Permissions:`,
                        description: `Sorry, you don't have permission to run this command.`,
                    }
                })
                return false;
            }
            if (!msg.guild.me.hasPermission(this.info.permissions)) {
                await msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.RED,
                        title: `❌ Missing Permissions:`,
                        description: `I don't have the required permissions to run this command!.`,
                        fields: [
                            {
                                name: `Required Permissions:`,
                                value: `\`${this.info.permissions.join(`, `)}\``
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
        if (this.info.restricted && !this.bot.config.maintainers.includes(msg.author.id)) {
            await msg.channel.send({
                embed: {
                    color: this.bot.configJS.color_codes.RED,
                    title: `❌ Missing Permissions`,
                    description: `This command is restricted to **bot maintainers only**.`
                }
            })
            return false;
        }
        return true;
    }
}