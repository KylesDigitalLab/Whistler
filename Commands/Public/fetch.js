const { Command } = require("../../Structures")
const { get } = require("axios")
const moment = require("moment")

module.exports = class FetchCommand extends Command {
    constructor(client) {
        super(client, {
            title: `fetch`,
            aliases: [`lookup`],
            description: "Lookup a server or user by their ID.",
            category: `bot`
        })
    }
    async run(msg, {
        Colors,
        Emojis,
        ImageURLOptions,
        GUILD_VERIFICATION_LEVELS
    }, {
        serverDocument
    }, suffix) {
        if (suffix) {
            let svr, user, cached, widget
            suffix = suffix.trim()
            const m = await msg.channel.send({
                embed: {
                    color: Colors.YELLOW,
                    title: `Fetching Discord...`,
                    description: `Hold on, we're looking up that ID...`
                }
            })
            let isID = true;
            //First, try seeing if it's a user
            user = this.client.users.cache.get(suffix);
            if(!user) {
                cached = false;
                user = await this.client.users.fetch(suffix).catch(async err => {
                    //Error code 50035 means the query was not a snowflake
                    if (err.code == 50035) {
                        isID = false;
                    } else if(err.code == 10013 || err.code == 0) {
                        isID = true;
                    } else {
                        await m.edit({
                            embed: {
                                color: Colors.RED,
                                title: `❌ Error:`,
                                description: `I couldn't fetch that user.`
                            }
                        })
                    }
                })
            } else {
                cached = true;
            }
            //If it was a user and fetching went OK, show user info
            if (user) {
                let status;
                let fields = [
                    {
                        name: `🤖 Bot?`,
                        value: `${user.bot ? "Yes" : "No"}`,
                        inline: true
                    },
                    {
                        name: `📆 Created:`,
                        value: `${moment(user.createdAt).format(serverDocument.config.date_format)} (${moment(user.createdAt).fromNow()})`,
                        inline: true
                    }
                ]
                if (user.presence) {
                    switch (user.presence.status) {
                        case `dnd`:
                            status = `🔴 Do Not Disturb`
                            break;
                        case `online`:
                            status = `🟢 Online`
                            break;
                        case `idle`:
                            status = `🟡 Idle`
                            break;
                        case `offline`:
                            status = `⚫ Offline`
                            break;
                    }
                    fields.push({
                        name: `🚦 Status:`,
                        value: status,
                        inline: true
                    })
                }
                await m.edit({
                    embed: {
                        color: Colors.INFO,
                        title: `${Emojis.USER} Information about ${user.tag}:`,
                        thumbnail: {
                            url: user.avatarURL(ImageURLOptions)
                        },
                        fields,
                        footer: {
                            text: `Fetched using ${cached ? "client cache" : "API - data may not be reliable"}.`
                        }
                    }
                })
            } 
            if (!user && isID) {
                //Lookup a guild by it's ID, first see if the bot has the server in it's cache
                svr = this.client.guilds.cache.get(suffix);
                if (!svr) {
                    widget = true;
                    const response = await get(`https://canary.discordapp.com/api/guilds/${encodeURIComponent(suffix)}/widget.json`).catch(async err => {
                        if (err.response && err.response.data.code == 50004) {
                            await m.edit({
                                embed: {
                                    color: Colors.WARNING,
                                    title: `⚠️ Widget Disabled`,
                                    description: `A valid server was found, but no information could be provided.`
                                }
                            })
                        } else if(err.response && err.response.status == 404) {
                            isID = false;
                        } else {
                            this.client.log.warn(`Failed to get server widget for '${suffix}'`, err)
                            await m.edit({
                                embed: {
                                    color: Colors.ERROR,
                                    title: `❌ Error:`,
                                    description: `Something went terribly wrong while trying to fetch the server widget.`
                                }
                            })
                        }
                    })
                    if (response) {
                        //widget.json doesn't provide much, so let's fetch the invite and get a more reliable guild object from that
                        const invite = await this.client.fetchInvite(response.data.instant_invite)
                        svr = invite.guild;
                        svr.widgetMembers = response.data.members;
                    }
                } else {
                    widget = false;
                }
                if (svr) {
                    let fields = [
                        {
                            name: `📆 Created:`,
                            value: `${moment(svr.createdAt).format(serverDocument.config.date_format)} (${moment(svr.createdAt).fromNow()})`,
                            inline: true
                        },
                        {
                            name: `${Emojis.USERS} Members:`,
                            value: `${widget ? `${svr.widgetMembers.length}` : `${svr.members.cache.size}`}`,
                            inline: true
                        },
                        {
                            name: `✅ Verification Level:`,
                            value: `${GUILD_VERIFICATION_LEVELS[svr.verificationLevel]}`,
                            inline: false
                        }
                    ]
                    await m.edit({
                        embed: {
                            color: Colors.INFO,
                            thumbnail: {
                                url: `${svr.iconURL ? svr.iconURL(ImageURLOptions) : ""}`
                            },
                            title: `Information about ${svr.name}:`,
                            fields,
                            footer: {
                                text: `Fetched using ${widget ? "server widget - data may not be reliable" : "client cache"}.`
                            }
                        }
                    })
                } 
            } 
            if(!svr && !isID) {
                //As a last resort, check if it's an invite
                const invite = await this.client.fetchInvite(suffix).catch(async err => {
                    if(err.code == 10006 || err.message.includes("Unknown Invite")) {
                        //At this point, after all that, we can safely conclude what the user provided was invalid.
                        await m.edit({
                            embed: {
                                color: Colors.SOFT_ERROR,
                                title: `❌ Error:`,
                                description: `That's not a valid user ID, server ID, or invite code.`
                            }
                        })
                    } else {
                        await m.edit({
                            embed: {
                                color: Colors.ERROR,
                                title: `❌ Error:`,
                                description: `Something went wrong while trying to fetch that invite.`
                            }
                        })
                    }
                })
                if(invite) {
                    svr = invite.guild
                    let ch = invite.channel;
                    user = invite.inviter
                    await m.edit({
                        embed: {
                            title: `Invite Information:`,
                            thumbnail: {
                                url: `${svr && svr.iconURL ? svr.iconURL(ImageURLOptions) : ""}`
                            },
                            color: Colors.INFO,
                            fields: [
                                {
                                    name: `Server:`,
                                    value: `${svr ? `${svr.name}` : `Unknown`}`,
                                    inline: true
                                },
                                {
                                    name: `Channel:`,
                                    value: `${ch && ch.name ? `#${ch.name}` : `Unknown`}`,
                                    inline: true
                                },
                                {
                                    name: `${Emojis.USER} Inviter:`,
                                    value: `${user ? `${user.tag}` : `Unknown`}`,
                                    inline: true
                                },
                                {
                                    name: `📆 Created:`,
                                    value: `${invite.createdAt ? `${moment(invite.createdAt).format(serverDocument.config.date_format)} (${moment(invite.createdAt).fromNow()})` : `Unknown`}`,
                                    inline: true
                                },
                                {
                                    name: `❌ Expires At:`,
                                    value: `${invite.expiresAt ? `${moment(invite.expiresAt).format(serverDocument.config.date_format)} (${moment(invite.expiresAt).fromNow()})` : `Unknown`}`,
                                    inline: true
                                }
                            ],
                            footer: {
                                text: `Server ID: ${svr ? svr.id : "Unknown"} | User ID: ${user ? user.id : "Unknown"}`
                            }
                        }
                    })
                }
            }
        } else {
            await msg.channel.send({
                embed: {
                    color: Colors.SOFT_ERROR,
                    description: `I need an ID or invite code to fetch.`
                }
            })
        }
    }
}