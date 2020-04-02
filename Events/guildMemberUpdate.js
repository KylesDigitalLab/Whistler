const { Event } = require("../Structures")
const moment = require("moment")
const { Constants } = require("../Internals")

module.exports = class guildMemberUpdate extends Event {
    constructor(client) {
        super(client, {
            title: `guildMemberUpdate`,
            type: `discord`
        })
    }
    async handle(oldMember, newMember) {
        const [svr, usr] = [newMember.guild, newMember.user];
        const serverDocument = await svr.populateDocument();
        if(serverDocument) {
            if (serverDocument.config.log.enabled) {
                const ch = svr.channels.cache.get(serverDocument.config.log.channel_id)
                let description, action;
                //Handle nickname changes 
                if(newMember.nickname !== oldMember.nickname) {
                    if(!oldMember.nickname && newMember.nickname) {
                        action = "Created"
                        description = `**${usr.tag}** set their nickname to \`${newMember.nickname}\``
                    } else if(!newMember.nickname && oldMember.nickname) {
                        action = "Removed"
                        description = `**${usr.tag}** removed their nickname of \`${oldMember.nickname}\``;
                    } else {
                       action = "Update"
                       description = `**${usr.tag}** set their nickname from \`${oldMember.nickname}\` to \`${newMember.nickname}\``
                    }
                    await ch.send({
                        embed: {
                            thumbnail: {
                                url: usr.avatarURL(Constants.ImageURLOptions)
                            },
                            color: this.client.getEmbedColor(svr, Constants.Colors.YELLOW),
                            title: `👤 Nickname ${action}`,
                            description: description,
                            footer: {
                                text: `User ID: ${newMember.id} | ${svr.formatDate()}`
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