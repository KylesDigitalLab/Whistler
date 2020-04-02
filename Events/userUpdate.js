const { Event } = require("../Structures")
const moment = require("moment")
const { Constants } = require("../Internals")

module.exports = class userUpdate extends Event {
    constructor(client) {
        super(client, {
            title: `userUpdate`,
            type: `discord`
        })
    }
    async handle(oldUser, newUser) {
        this.client.guilds.cache
            .filter(svr => svr.members.cache.has(newUser.id))
            .forEach(async svr => {
                let serverDocument = await svr.populateDocument();
                if (serverDocument) {
                    if (serverDocument.config.log.enabled) {
                        let ch = svr.channels.cache.get(serverDocument.config.log.channel_id)
                        //Handle avatar changes 
                        if (newUser.avatar !== oldUser.avatar) {
                            await ch.send({
                                embed: {
                                    color: this.client.getEmbedColor(svr, Constants.Colors.YELLOW),
                                    thumbnail: {
                                        url: newUser.avatarURL(Constants.ImageURLOptions)
                                    },
                                    title: `👤 Avatar Update`,
                                    description: `**${newUser.tag}** updated [their old avatar](${oldUser.avatarURL()}).`,
                                    footer: {
                                        text: `User ID: ${newUser.id} | ${moment(Date.now()).format(serverDocument.config.date_format)}`
                                    }
                                }
                            })
                        }
                        //Handle username changes
                        if (newUser.username !== oldUser.username) {
                            await ch.send({
                                embed: {
                                    color: this.client.getEmbedColor(svr, Constants.Colors.YELLOW),
                                    thumbnail: {
                                        url: newUser.avatarURL(Constants.ImageURLOptions)
                                    },
                                    title: `👤 Username Update`,
                                    description: `**${oldUser.tag}** updated their username to **${newUser.username}**.`,
                                    footer: {
                                        text: `User ID: ${newUser.id} | ${moment(Date.now()).format(serverDocument.config.date_format)}`
                                    }
                                }
                            })
                        }
                        if (newUser.discriminator !== oldUser.discriminator) {
                            await ch.send({
                                embed: {
                                    color: this.client.getEmbedColor(svr, Constants.Colors.YELLOW),
                                    thumbnail: {
                                        url: newUser.avatarURL(Constants.ImageURLOptions)
                                    },
                                    title: `#️⃣  Discriminator Update`,
                                    description: `**${newUser.username}**'s discriminator was updated from **${oldUser.discriminator}** to **${newUser.discriminator}**.`,
                                    footer: {
                                        text: `User ID: ${newUser.id} | ${moment(Date.now()).format(serverDocument.config.date_format)}`
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
            })
    }
}