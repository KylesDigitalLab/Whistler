const { Event } = require("../Structures")
const moment = require("moment")
const { Constants } = require("../Internals")

module.exports = class presenceUpdate extends Event {
    constructor(client) {
        super(client, {
            title: `presenceUpdate`,
            type: `discord`
        })
    }
    async handle(oldPresence, newPresence) {
        const [svr, member, user] = [newPresence.guild, newPresence.member, newPresence.user];
        const serverDocument = await svr.populateDocument();
        if (serverDocument) {
            if (serverDocument.config.log.enabled) {
                const ch = svr.channels.cache.get(serverDocument.config.log.channel_id)
                if (oldPresence) {
                    if (newPresence.status !== oldPresence.status) {
                        await ch.send({
                            embed: {
                                color: Constants.Colors[newPresence.status.toUpperCase()] || this.client.getEmbedColor(svr),
                                thumbnail: {
                                    url: user.avatarURL(Constants.ImageURLOptions)
                                },
                                title: `${Constants.Emojis[newPresence.status.toUpperCase()] || `🚦`} Status Update`,
                                description: `**${user.tag}** is now **${newPresence.status}**.`,
                                footer: {
                                    text: `User ID: ${user.id} | ${svr.formatDate()}`
                                }
                            }
                        })
                    }
                    //Member started playing game
                    if (!oldPresence.activities[0] && newPresence.activities[0]) {
                        await ch.send({
                            embed: {
                                color: Constants.Colors[newPresence.status.toUpperCase()] || this.client.getEmbedColor(svr),
                                thumbnail: {
                                    url: user.avatarURL(Constants.ImageURLOptions)
                                },
                                title: `🎮 Game Update`,
                                description: `**${user.tag}** started playing **${newPresence.activities[0].name}**.`,
                                footer: {
                                    text: `User ID: ${user.id} | ${svr.formatDate()}`
                                }
                            }
                        })
                    }
                    //Member updated game
                    if(oldPresence.activities[0] && newPresence.activities[0]) {
                        if (oldPresence.activities[0] !== newPresence.activities[0]) {
                            if(oldPresence.activities[0].name !== newPresence.activities[0].name) {
                                await ch.send({
                                    embed: {
                                        color: Constants.Colors[newPresence.status.toUpperCase()] || this.client.getEmbedColor(svr),
                                        thumbnail: {
                                            url: user.avatarURL(Constants.ImageURLOptions)
                                        },
                                        title: `🎮 Game Update`,
                                        description: `**${user.tag}** updated their game to **${newPresence.activities[0].name}**.`,
                                        footer: {
                                            text: `User ID: ${user.id} | ${svr.formatDate()}`
                                        }
                                    }
                                })
                            }
                        }
                    }
                    //Member stopped playing game
                    if (!newPresence.activities[0] && oldPresence.activities[0]) {
                        await ch.send({
                            embed: {
                                color: Constants.Colors[newPresence.status.toUpperCase()] || this.client.getEmbedColor(svr),
                                thumbnail: {
                                    url: user.avatarURL(Constants.ImageURLOptions)
                                },
                                title: `🎮 Game Update`,
                                description: `**${user.tag}** stopped playing **${oldPresence.activities[0].name}**.`,
                                footer: {
                                    text: `User ID: ${user.id} | ${svr.formatDate()}`
                                }
                            }
                        })
                    }
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