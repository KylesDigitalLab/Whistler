const { Event } = require("../Structures")
const { Constants } = require("../Internals")
const moment = require("moment")

module.exports = class guildUpdate extends Event {
    constructor(client) {
        super(client, {
            title: `guildUpdate`,
            type: `discord`
        })
    }
    async handle(oldSvr, svr) {
        const serverDocument = await svr.populateDocument();
        if(serverDocument) {
            if(serverDocument.config.log.enabled) {
                const ch = svr.channels.cache.get(serverDocument.config.log.channel_id)
                //Handle icon changes
                if(svr.icon !== oldSvr.icon) {
                    await ch.send({
                        embed: {
                            thumbnail: {
                                url: svr.iconURL(Constants.ImageURLOptions)
                            },
                            color: this.client.getEmbedColor(svr, Constants.Colors.YELLOW),
                            title: `Server Icon Update`,
                            description: `The server's icon was updated. [Old icon](${oldSvr.iconURL(Constants.ImageURLOptions)})`,
                            footer: {
                                text: `${svr.formatDate()}`
                            }
                        }
                    })
                }
                //Handle name changes
                if(svr.name !== oldSvr.name) {
                    await ch.send({
                        embed: {
                            thumbnail: {
                                url: svr.iconURL(Constants.ImageURLOptions)
                            },
                            color: this.client.getEmbedColor(svr, Constants.Colors.YELLOW),
                            title: `Server Name Update`,
                            description: `The server name was changed from **${oldSvr.name}** to **${svr.name}**.`,
                            footer: {
                                text: `${svr.formatDate()}`
                            }
                        }
                    })
                }
            }
        } else {
            this.client.log.error(`Could not find server document for ${svr.name}`, {
                svr_id: svr.id,
                serverDocument: serverDocument
            })
        }
    }
}