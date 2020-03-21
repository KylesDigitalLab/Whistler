const Manager = require("../Structures/Manager")
const { Collection } = require("discord.js");
const { readdir } = require("fs").promises
const { Constants } = require("../Internals")
const clearModuleCache = require("./clearModuleCache")

module.exports = class CommandManager extends Manager {
    constructor(client) {
        super(client);
        this.public = {
            all: new Collection(),
            aliases: new Collection()
        }
        this.private = {
            all: new Collection(),
            aliases: new Collection()
        }
        this.shared = {
            all: new Collection(),
            aliases: new Collection()
        }
        this.categories = new Collection();
        Constants.CommandCategories.forEach(c => this.categories.set(c.name, c))
        
    }
    async loadAllPublic() {
        const commands = await readdir(`./Commands/Public`)
        commands.forEach(cmdFile => {
            try {
                let path = `../Commands/Public/${cmdFile}`
                clearModuleCache(path)
                const cmd = new (require(path))(this.client)
                this.public.all.set(cmd.data.title, cmd)
                cmd.data.aliases.forEach(a => this.public.aliases.set(a, cmd.data.title))
            } catch (err) {
                this.client.log.error(`Failed to load public command ${cmdFile}`, err)
            }
        })
        return this;
    }
    async loadAllPrivate() {
        const commands = await readdir(`./Commands/Private`)
        commands.forEach(cmdFile => {
            try {
                let path = `../Commands/Private/${cmdFile}`
                clearModuleCache(path)
                const cmd = new (require(path))(this.client)
                this.private.all.set(cmd.data.title, cmd)
                cmd.data.aliases.forEach(a => this.private.aliases.set(a, cmd.data.title))
            } catch (err) {
                this.client.log.error(`Failed to load private command ${cmdFile}`, err)
            }
        })
        return this;
    }
    async loadAllShared() {
        const commands = await readdir(`./Commands/Shared`)
        commands.forEach(cmdFile => {
            try {
                let path = `../Commands/Shared/${cmdFile}`
                clearModuleCache(path)
                const cmd = new (require(path))(this.client)
                this.shared.all.set(cmd.data.title, cmd)
                cmd.data.aliases.forEach(a => this.shared.aliases.set(a, cmd.data.title))
            } catch (err) {
                this.client.log.error(`Failed to load shared command ${cmdFile}`, err)
            }
        })
        return this;
    }
    async loadAll() {
        await this.loadAllPublic()
        await this.loadAllPrivate()
        await this.loadAllShared()
        return this;
    }
    getPublic(str) {
        return this.public.all.get(str) || this.public.all.get(this.public.aliases.get(str))
    }
    getPrivate(str) {
        return this.private.all.get(str) || this.private.all.get(this.private.aliases.get(str))
    }
    getShared(str) {
        return this.shared.all.get(str) || this.shared.all.get(this.shared.aliases.get(str))
    }
    getPrefix(serverDocument) {
        return `${serverDocument ? serverDocument.config.prefix : this.client.config.default_prefix}`
    }
    check(msg, serverDocument) {
        let str, prefix;
        if(!serverDocument) {
            prefix = this.client.config.default_prefix
        } else {
            prefix = serverDocument.config.prefix
        }
        msg = msg.trim()
        if (msg.indexOf(prefix) == 0) {
            str = msg.substring(prefix.length)
        } else {
            return;
        }
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