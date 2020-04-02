const { Event } = require("../Structures")
const moment = require("moment")
const { Constants } = require("../Internals")

module.exports = class guildMemberAdd extends Event {
    constructor(client) {
        super(client, {
            title: `guildMemberAdd`,
            type: `discord`
        })
    }
    async handle(member) {
        const [svr, usr] = [member.guild, member.user];
        this.client.log.debug(`User ${usr.tag} joined server ${svr.name}`, {
            svr_id: svr.id,
            usr_id: member.id
        })
        const serverDocument = await svr.populateDocument()
        if (serverDocument) {
            serverDocument.members.push({
                _id: member.id
            })
            const memberDocument = member.document;
            if (serverDocument.config.log.enabled) {
                const ch = svr.channels.cache.get(serverDocument.config.log.channel_id)
                await ch.send({
                    embed: {
                        thumbnail: {
                            url: usr.avatarURL(Constants.ImageURLOptions)
                        },
                        color: this.client.getEmbedColor(svr, Constants.Colors.YELLOW),
                        title: `👤 Member Joined`,
                        description: `**${usr.tag}** has joined the server.`,
                        footer: {
                            text: `User ID: ${member.id} | ${svr.formatDate(member.joinedAt)}`
                        }
                    }
                })
            }
            for (const roleDocument of serverDocument.roles.filter(r => r.auto_role)) {
                const role = svr.roles.cache.get(roleDocument._id)
                if (role) {
                    if (svr.me.hasPermission("MANAGE_ROLES")) {
                        await member.roles.add(role).catch(err => {
                            this.client.log.warn(`Failed to give new member ${usr.tag} role '${role.name}'`, {
                                svr_id: svr.id,
                                usr_id: usr.id,
                                role_id: roleDocument._id
                            }, err)
                        })
                    }
                }
            }

            await serverDocument.save();
        } else {
            this.client.log.error(`Could not find server document for ${svr.name}`, {
                svr_id: svr.id,
                serverDocument: serverDocument
            })
        }
    }
}