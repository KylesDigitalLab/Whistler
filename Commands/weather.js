const { find } = require("weather-js")
const { Command } = require("./../Structures")

module.exports = class Weather extends Command {
    constructor(bot) {
        super(bot, {
            title: `weather`,
            aliases: [],
            description: `Gets detailed weather information for a certain location.`,
            category: `misc`
        })
    }
    run = async (db, msg, serverData, userData, memberData, suffix) => {
        if (suffix) {
            find({
                search: suffix,
                degreeType: serverData.config.units.temperature
            }, (err, res) => {
                if (err || !res) {
                    msg.channel.send({
                        embed: {
                            color: this.bot.configJS.color_codes.RED,
                            title: `❌ Error:`,
                            description: `I couldn't get weather information for \`${suffix}\`.`
                        }
                    })
                } else {
                    if (res.current) {
                        res = res[0];
                        let weatherIcon, embedColor;
                        switch (res.current.skytext) {
                            case `Rain` || `Rain Showers`:
                                weatherIcon = `🌧️`
                                break;
                            case `Sunny` || `Clear`:
                                weatherIcon = `☀️`
                                break;
                            case `Partly Cloudy` || `Mostly Cloudy` || `Cloudy`:
                                weatherIcon = `☁️`
                                break;
                            default:
                                weatherIcon = `🌥️`
                        }
                        embedColor = this.bot.getEmbedColor(msg.guild)
                        msg.channel.send({
                            embed: {
                                color: embedColor,
                                title: `🌥️ Weather for ${res.current.observationpoint}:`,
                                fields: [
                                    {
                                        name: `${weatherIcon} Weather:`,
                                        value: res.current.skytext,
                                        inline: true
                                    }, {
                                        name: '🌡️ Temperature:',
                                        value: `${res.current.temperature}°${res.location.degreetype}`,
                                        inline: true
                                    }, {
                                        name: '🍃 Wind:',
                                        value: res.current.winddisplay,
                                        inline: true
                                    },
                                    {
                                        name: `💦 Humidity:`,
                                        value: `${res.current.humidity}%`,
                                        inline: true
                                    },
                                    {
                                        name: `😓 Feels Like:`,
                                        value: `${res.current.feelslike}°${res.location.degreetype}`,
                                        inline: true
                                    },
                                    {
                                        name: `⛈️ Precipitation:`,
                                        value: `${res.forecast[1].precip}%`,
                                        inline: true
                                    }
                                ],
                                footer: {
                                    text: `Weather information provided by weather.service.msn.com`,
                                }
                            }
                        })
                    } else {
                        msg.channel.send({
                            embed: {
                                color: this.bot.configJS.color_codes.RED,
                                title: `❌ Error:`,
                                description: `I couldn't get weather information for \`${suffix}\`.`
                            }
                        })
                    } 
                }
            })
        } else {
            msg.channel.send({
                embed: {
                    color: this.bot.configJS.color_codes.RED,
                    title: bot.user.username,
                    description: `❌ Please specify a location!`,
                    footer: {
                        text: `An error may have occurred. Try being more specific.`
                    }
                }
            })
        }
    }
}
