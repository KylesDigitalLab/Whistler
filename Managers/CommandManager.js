const Manager  = require("../Structures/Manager")
const { Collection } = require("discord.js");
const { readdir } = require("fs").promises

module.exports = class CommandManager extends Manager {
    constructor(bot) {
        super(bot);
        this.all = new Collection();
        this.aliases = new Collection();
    }
    loadAll = async() => {
        const commands = await readdir(`./Commands`)
        commands.forEach(cmdFile => {
            try {
                const path = `../Commands/${cmdFile}`
                this.bot.log.silly(`Loading command: ${path}`)
                this.bot.clearCache(path)
                const cmd = new (require(path))(this.bot)
                this.all.set(cmd.info.title, cmd)
                cmd.info.aliases.forEach(a => this.aliases.set(a, cmd.info.title))
            } catch (err) {
                this.bot.log.error(`Failed to load command '${cmdFile}':\r\n`, err)
            } finally {
                this.bot.log.debug(`Successfully loaded command '${cmdFile}'`)
            }
        })
    }
    check = (msg, serverDocument) => {
        let str;
        msg = msg.trim()
        if (msg.indexOf(serverDocument.config.prefix) == 0) str = msg.substring(serverDocument.config.prefix.length)
        else return;
        if (str.indexOf(" ") == -1) {
            return {
                command: str.toLowerCase(),
                suffix: ""
            }
        } else {
            return {
                command: str.substring(0, str.indexOf(" ")).toLowerCase(),
                suffix: str.substring(str.indexOf(" ") + 1).trim()
            }
        }
    }
}