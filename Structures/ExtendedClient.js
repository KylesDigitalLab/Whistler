const { Client, Collection } = require("discord.js");
const { CommandManager, EventManager } = require("../Managers")
const { readdir } = require("fs").promises
const { Logger } = require("winston")

/** 
 * Represents a Discord client
 * @extends Client
*/
module.exports = class ExtendedClient extends Client {
    /**
     * @param {Object} options 
     * @param {Object} options.clientOptions 
     */
    constructor(config, configJS, options) {
        if (options) {
            super(options.clientOptions || {});
        } else {
            super()
        }
        this.log = new Logger(configJS.winston);

        Object.defineProperties(this, {
            config: {
                value: config,
                enumerable: false,
                writeable: false
            },
            configJS: {
                value: configJS,
                enumerable: false,
                writeable: false
            }
        })
        /**
         * @type {EventManager}
         */
        this.events = new EventManager(this);
        /**
         * @type {CommandManager}
         */
        this.commands = new CommandManager(this);
    }
    getMember = (str, svr) => {
        let member;
        str = str.trim();
        if (str.indexOf("<@!") == 0) {
            member = svr.members.cache.get(str.substring(3, str.length - 1));
        } else if (str.indexOf("<@") == 0) {
            member = svr.members.cache.get(str.substring(2, str.length - 1));
        } else if (!isNaN(str)) {
            member = svr.members.cache.get(str);
        } else {
            if (str.indexOf("@") == 0) str = str.slice(1)
            if (str.lastIndexOf("#") == str.length - 5 && !isNaN(str.substring(str.lastIndexOf("#") + 1))) {
                member = svr.members.filter(member => member.user.username == str.substring(0, str.lastIndexOf("#")))
                    .find(member => member.user.discriminator == str.substring(str.lastIndexOf("#") + 1));
            } else {
                member = svr.members.cache.find(member => member.user.username.toLowerCase() == str.toLowerCase());
            }
            if (!member) member = svr.members.cache.find(member => member.nickname && member.nickname.toLowerCase() == str.toLowerCase())
        }
        return member;
    }
    findChannel = (str, svr) => {
        let channels = svr.channels.cache;
        str = str.trim();
        return channels.get(str) || channels.find(c => c.name.toLowerCase() == str.toLowerCase() || c.toString() == str);
    }
    getEmbedColor = (svr, altColor) => {
        let color;
        const member = svr.member(this.user);
        if (member.displayColor == 0) {
            color = altColor || this.configJS.color_codes.BLUE
        } else {
            color = member.displayColor
        }
        return color;
    }
    loadEvents = async (path) => {
        const events = await readdir(path).catch(err => this.log.error(`Failed to read event directory:\r\n`, err))
        events.forEach(event => {
            try {
                const pathto = `../${path}/${event}`
                this.log.debug(`Loading event: ${pathto}`)
                this.clearCache(pathto)
                const evt = new (require(pathto))(this)
                if (evt.info.type == "Discord") {
                    this.discordEvents.set(evt.info.title, evt)
                } else if (evt.info.type == "Process") {
                    this.processEvents.set(evt.info.title, evt)
                }
            } catch (err) {
                this.log.error(`Failed to load event '${event}'\r\n`, err)
            } finally {
                this.log.debug(`Loaded event '${event}'`)
            }
        })
    }
    clearCache = moduleId => {
        const fullPath = require.resolve(moduleId);

        if (require.cache[fullPath] && require.cache[fullPath].parent) {
            let i = require.cache[fullPath].parent.children.length;

            while (i -= 1) {
                if (require.cache[fullPath].parent.children[i].id === fullPath) {
                    require.cache[fullPath].parent.children.splice(i, 1);
                }
            }
        }

        delete require.cache[fullPath];
    }
}