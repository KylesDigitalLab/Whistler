const { find } = require("weather-js")
const { Command } = require("../../Structures")

module.exports = class WeatherCommand extends Command {
    constructor(client) {
        super(client, {
            title: `weather`,
            aliases: [],
            description: `Gets detailed weather information for a certain location.`,
            usage: `<location>`,
            category: `media`
        })
    }
    async run(msg, { 
        Colors 
    }, {
        serverDocument,
        userDocument
    }, suffix) {
        if (suffix) {
            find({
                search: suffix,
                degreeType: serverDocument.config.units.temperature
            }, (err, res) => {
                if (err || !res) {
                    msg.channel.send({
                        embed: {
                            color: Colors.SOFT_ERROR,
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
                        embedColor = this.client.getEmbedColor(msg.guild)
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
                                color: Colors.SOFT_ERROR,
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
                    color: Colors.ERROR,
                    title: this.client.user.username,
                    description: `❌ Please specify a location!`,
                    footer: {
                        text: `An error may have occurred. Try being more specific.`
                    }
                }
            })
        }
    }
}
