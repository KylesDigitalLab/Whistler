const { Command } = require("./../Structures")

const auth = require("./../Config/auth.json")
const yt = require("youtube-node")
const youtube = new yt()

module.exports = class Youtube extends Command {
    constructor(bot) {
        super(bot, {
            title: "youtube",
            aliases: [`yt`, `ytsearch`],
            description: "Searches YouTube for videos, channels, and playlists.",
            category: `misc`
        })
    }
    run = async(db, msg, serverData, userData, memberData, suffix) => {
        if (suffix) {
            youtube.setKey(auth.keys.youtubeAPI)
            youtube.search(suffix, 1, async(err, res) => {
                if (err) {
                   await msg.channel.send({
                        embed: {
                            color: this.bot.configJS.color_codes.RED,
                            title: `❌ Error:`,
                            description: `Sorry, we failed to search YouTube.`,
                            footer: {
                                text: `Is your Google API key correct?`
                            }
                        }
                    })
                } else {
                    let msgText;
                    let item = res.items[0]
                    if (item) {
                        switch (item.id.kind) {
                            case "youtube#playlist":
                                msgText = `⏯️ https://www.youtube.com/playlist?list=${item.id.playlistId}`;
                                break;
                            case "youtube#video":
                                msgText = `📹 https://youtu.be/${item.id.videoId}`;
                                break;
                            case "youtube#channel":
                                msgText = `📺 https://www.youtube.com/channel/${item.id.channelId}`;
                                break;
                        }
                        await msg.channel.send(msgText)
                    } else {
                        await msg.channel.send({
                            embed: {
                                color: this.bot.configJS.color_codes.YELLOW,
                                title: `⚠️ Warning:`,
                                description: `I couldn't get any search results for \`${suffix}\``
                            }
                        })
                    }
                }
            })
        }
    }
}