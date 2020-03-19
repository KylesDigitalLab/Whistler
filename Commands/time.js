const { Command } = require("./../Structures")
const { get } = require("axios")
const moment = require("moment")
const auth = require("./../Config/auth.json")

module.exports = class Time extends Command {
    constructor(bot) {
        super(bot, {
            title: `time`,
            aliases: ['tz', `timezone`],
            description: "Gets the time for a location..",
            category: `misc`
        })
    }
    run = async (db, msg, serverDocument, userDocument, memberDocument, suffix) => {
        let address;
        if(suffix) {
            if(suffix.indexOf("<@") == 0) {
                let member = this.bot.getMember(suffix, msg.guild)
                if(member) {
                    try {
                      const usrData = await db.users.findOrCreate({
                          _id: member.user.id
                      })
                      address = usrData.location
                    } catch (err) {
                        this.bot.log.error(`Failed to find or create user data:\r\n`, {
                            usr_id: member.user.id
                        }, err)
                        await msg.channel.send({
                            embed: {
                                color: this.bot.configJS.color_codes.RED,
                                title: `❌ Error:`,
                                description: `I couldn't get that user's location.`
                            }
                        })
                    }
                }
            } else {
                address = encodeURIComponent(suffix);
            }
        } else {
            address = userDocument.location;
        }
        if (address) {
            const reponse = await get(`https://maps.googleapis.com/maps/api/geocode/json`, {
                params: {
                    address: address,
                    key: auth.keys.googleMapsAPI
                },
                headers: {
                    "Accept": "application/json"
                }
            }).catch(async err => {
                this.bot.log.error(`Failed to send HTTP GET request:\r\n`, err.stack)
                await msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.RED,
                        title: `❌ Error:`,
                        description: `An HTTP error occurred while getting the time.`
                    }
                })
            })
            const res = reponse.data;
            if (res.status == "OK") {
                const response2 = await get(`https://maps.googleapis.com/maps/api/timezone/json`, {
                    params: {
                        location: `${res.results[0].geometry.location.lat},${res.results[0].geometry.location.lng}`,
                        timestamp: Math.floor(Date.now() / 1000),
                        key: auth.keys.googleMapsAPI
                    },
                    headers: {
                        "Accept": "application/json"
                    }
                }).catch(async err => {
                    this.bot.log.error(`Failed to send HTTP GET request:\r\n`, err.stack)
                    await msg.channel.send({
                        embed: {
                            color: this.bot.configJS.color_codes.RED,
                            title: `❌ Error:`,
                            description: `An HTTP error occurred while getting the time.`
                        }
                    })
                })
                const res2 = response2.data;
                await msg.channel.send({
                    embed: {
                        color: this.bot.getEmbedColor(msg.guild),
                        title: `🕐 Time:`,
                        description: `Currently, it's **${moment(new Date(Date.now() + (parseInt(res2.rawOffset) * 1000) + (parseInt(res2.dstOffset) * 1000))).utc().format("h:mma")}** in **${res.results[0].address_components[0].long_name}**. The timezone is **${res2.timeZoneName}**.`,
                        footer: {
                            text: `Information provided by Google Maps API.`
                        }
                    }
                })
            } else {
                await msg.channel.send({
                    embed: {
                        color: this.bot.configJS.color_codes.YELLOW,
                        title: `⚠️ Warning:`,
                        description: `I couldn't find that location.`
                    }
                })
            }

        } else {
            await msg.channel.send({
                embed: {
                    color: this.bot.configJS.color_codes.YELLOW,
                    title:  `⚠️ Warning:`,
                    description: `I need a location to get the time for.`
                }
            })
        }
    }
}