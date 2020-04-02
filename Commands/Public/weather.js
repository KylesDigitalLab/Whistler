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
    async getWeather(opitons) {
        return new Promise((y, n) => require("weather-js").find(opitons, (err, data) => {
            if (err) {
                n(err);
            }
            y(data);
        }))
    }
    async run(msg, {
        Colors
    }, {
        serverDocument,
        userDocument
    }, suffix) {
        if (suffix) {
            const results = await this.getWeather({
                search: suffix,
                degreeType: serverDocument.config.units.temperature
            })
            if (!results.length) {
                await msg.channel.send({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        title: `❌ Error:`,
                        description: `I couldn't get weather information for \`${suffix}\`.`
                    }
                })
            } else {
                let res = results[0];
                let weatherIcon
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
                await msg.channel.send({
                    embed: {
                        color: this.client.getEmbedColor(msg.guild),
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
            }
        } else {
            await msg.channel.send({
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