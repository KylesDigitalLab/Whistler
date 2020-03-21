const { Client, Collection, version: djsVersion } = require("discord.js");
const { CommandManager, EventManager } = require("../Managers")
const { platform, release } = require("os")
const { readdir } = require("fs").promises
const { Logger } = require("winston")
const {models: db} = require("mongoose")
const { Constants } = require("../Internals")

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

        this.initializedAt = Date.now();

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
        this.db = db;
        /**
         * @type {EventManager}
         */
        this.events = new EventManager(this);
        /**
         * @type {CommandManager}
         */
        this.commands = new CommandManager(this);

        this.log.info(`Extended Discord client initialized - running Node.js ${process.version} on ${platform()} ${release()} with Discord.js ${djsVersion}`)
    }

    getEmbedColor(svr, color) {
        if (svr) {
            const member = svr.member(this.user);
            if (member.displayColor == 0) {
                return defaultColor;
            } else {
                return member.displayColor
            }
        } else {
            return color || Constants.Colors.INFO;
        }
    }
}