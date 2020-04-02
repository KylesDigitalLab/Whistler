const { Structures } = require("discord.js")
const { models } = require("mongoose")
const moment = require("moment")

module.exports = () => {
    Structures.extend(`User`, User => {
        class ExtendedUser extends User {
            async populateDocument() {
                this.userDocument = await models.users.findOrCreate({
                    _id: this.id
                })
                this.userDocument.tag = this.tag;
                return this.userDocument;
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
                return this.serverDocument
            }
            formatDate(date) {
                if(!date) date = Date.now()
                return moment(date).tz(this.serverDocument.config.timezone).format(this.serverDocument.config.date_format)
            }
            findMember(str) {
                let member;
                str = str.trim();
                if (str.indexOf("<@!") == 0) {
                    member = this.members.cache.get(str.substring(3, str.length - 1));
                } else if (str.indexOf("<@") == 0) {
                    member = this.members.cache.get(str.substring(2, str.length - 1));
                } else if (!isNaN(str)) {
                    member = this.members.cache.get(str);
                } else {
                    if (str.indexOf("@") == 0) {
                        str = str.slice(1)
                    }
                    if (str.lastIndexOf("#") == str.length - 5 && !isNaN(str.substring(str.lastIndexOf("#") + 1))) {
                        member = this.members.cache.filter(member => member.user.username == str.substring(0, str.lastIndexOf("#")))
                            .find(member => member.user.discriminator == str.substring(str.lastIndexOf("#") + 1));
                    } else {
                        member = this.members.cache.find(member => member.user.username.toLowerCase() == str.toLowerCase());
                    }
                    if (!member) {
                        member = this.members.cache.find(member => member.nickname && member.nickname.toLowerCase() == str.toLowerCase())
                    }
                }
                return member;
            }
            findChannel(str) {
                str = str.trim();
                return this.channels.cache.get(str) || this.channels.cache.find(c => c.name.toLowerCase() == str.toLowerCase() || c.toString() == str);
            }
        }
        return ExtendedGuild;
    })
    Structures.extend(`GuildMember`, GuildMember => {
        class ExtendedGuildMember extends GuildMember {
            get document() {
                let doc = this.guild.serverDocument.members.id(this.id)
                if (!doc) {
                    this.guild.serverDocument.members.push({
                        _id: this.id
                    })
                    doc = this.guild.serverDocument.members.id(this.id)
                }
                return doc;
            }
            get embedColor() {
                let color = this.roles.highest.color
                if(color == 0) {
                    color = this.client.getEmbedColor(this.guild)
                }
                return color;
            }
        }
        return ExtendedGuildMember;
    })
    Structures.extend(`Role`, Role => {
        class ExtendedRole extends Role {
            get document() {
                let doc = this.guild.serverDocument.roles.id(this.id)
                if (!doc) {
                    this.guild.serverDocument.roles.push({
                        _id: this.id
                    })
                    doc = this.guild.serverDocument.roles.id(this.id)
                }
                return doc;
            }
        }
        return ExtendedRole;
    })
    Structures.extend(`TextChannel`, TextChannel => {
        class ExtendedTextChannel extends TextChannel {
            get document() {
                let doc = this.guild.serverDocument.channels.text.id(this.id)
                if (!doc) {
                    this.guild.serverDocument.channels.text.push({
                        _id: this.id
                    })
                    doc = this.guild.serverDocument.channels.text.id(this.id)
                }
                return doc;
            }
        }
        return ExtendedTextChannel;
    })
    Structures.extend(`VoiceChannel`, VoiceChannel => {
        class ExtendedVoiceChannel extends VoiceChannel {
            get document() {
                let doc = this.guild.serverDocument.channels.voice.id(this.id)
                if (!doc) {
                    this.guild.serverDocument.channels.voice.push({
                        _id: this.id
                    })
                    doc = this.guild.serverDocument.channels.voice.id(this.id)
                }
                return doc;
            }
        }
        return ExtendedVoiceChannel;
    })
}
