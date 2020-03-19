const { Structures } = require("discord.js")
const { models } = require("mongoose")

module.exports = () => {
    Structures.extend(`User`, User => {
        class ExtendedUser extends User {
            async populateDocument() {
                this.userDocument = await models.users.findOrCreate({
                    _id: this.id
                })
            }
        }
        return ExtendedUser;
    })
    Structures.extend(`Guild`, Guild => {
        class ExtendedGuild extends Guild {
            async populateDocument() {
                this.serverDocument = await models.servers.findOne({
                    _id: this.id
                })
            }
        }
        return ExtendedGuild;
    })
    Structures.extend(`GuildMember`, GuildMember => {
        class ExtendedGuildMember extends GuildMember {
            get memberDocument() {
                let doc = this.guild.serverDocument.members.id(this.id)
                if(!doc) {
                    this.guild.serverDocument.members.push({
                        _id: this.id
                    })
                    doc = this.guild.serverDocument.members.id(this.id)
                }
                return doc;
            }
        }
        return ExtendedGuildMember;
    })
}
