const { Client, Collection, version: djsVersion } = require("discord.js");
const { CommandManager, EventManager } = require("../Managers")
const { platform, release } = require("os")
const { Constants, Logger } = require("../Internals")
const { StructureExtender } = require("../Modules/Utils")
const { models } = require("mongoose")

/** 
 * Represents a Discord client
 * @extends Client
*/
module.exports = class ExtendedClient extends Client {
    /**
     * @param {Object} options 
     */
    constructor(config, configJS, options) {
        StructureExtender()

        super(options ? options.client || {} : {});

        this.initializedAt = Date.now();

        this.log = new Logger();

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
        this.db = models;
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
            const member = svr.me;
            if (member.displayColor == 0) {
                return Constants.Colors.INFO;
            } else {
                return member.displayColor
            }
        } else {
            return color || Constants.Colors.INFO;
        }
    }
}