const { Command } = require("../../Structures")
const { auth } = require("../../Config")
const { get } = require("axios")
const moment = require("moment")

module.exports = class YouTubeCommand extends Command {
    constructor(client) {
        super(client, {
            title: "youtube",
            aliases: [`yt`, `ytsearch`],
            description: "Searches YouTube for videos, channels, and playlists.",
            usage: `<query>`,
            category: `media`
        })
    }
    async run(msg, { Colors }, { serverDocument }, suffix) {
        if (suffix) {
            suffix = suffix.trim();
            try {
                const { data } = await get(`https://www.googleapis.com/youtube/v3/search`, {
                    params: {
                        part: "snippet",
                        key: auth.keys.googleAPI,
                        q: encodeURIComponent(suffix).replace(/%20/g, "+"),
                        maxResults: 1,
                        safeSearch: "none"
                    },
                    headers: {
                        "Accept": "application/json"
                    }
                })
                if (data.items.length > 0) {
                    data.items.forEach(async item => {
                        const publishedAt = moment(item.snippet.publishedAt);
                        switch (item.id.kind) {
                            case `youtube#video`:
                                await msg.channel.send(`https://youtu.be/${item.id.videoId}`)
                                try {
                                    const { data: vData } = await get(`https://www.googleapis.com/youtube/v3/videos`, {
                                        params: {
                                            part: "statistics",
                                            id: item.id.videoId,
                                            key: auth.keys.googleAPI
                                        },
                                        headers: {
                                            "Accept": "application/json"
                                        }
                                    })
                                    await msg.channel.send({
                                        embed: {
                                            color: Colors.YOUTUBE,
                                            description: item.snippet.description,
                                            fields: [
                                                {
                                                    name: `View Count:`,
                                                    value: `${formatNumber(vData.items[0].statistics.viewCount)} views`,
                                                    inline: true
                                                },
                                                {
                                                    name: `Comments:`,
                                                    value: `${formatNumber(vData.items[0].statistics.commentCount)} comments`,
                                                    inline: true
                                                },
                                                {
                                                    name: `Rating:`,
                                                    value: `${formatNumber(vData.items[0].statistics.likeCount)} likes,  ${formatNumber(vData.items[0].statistics.dislikeCount)} dislkes`,
                                                    inline: true
                                                },
                                                {
                                                    name: `Published:`,
                                                    value: `${publishedAt.format(serverDocument.config.date_format)} (${publishedAt.fromNow()})`,
                                                    inline: false
                                                }
                                            ],
                                            footer: {
                                                text: `All information provided by YouTube Data API v3.`
                                            }
                                        }
                                    })
                                } catch ({ stack }) {
                                    this.client.log.error(`Failed to contact YouTube Data API for video stats`, {
                                        svr_id: msg.guild.id,
                                        ch_id: msg.channel.id,
                                        usr_id: msg.author.id,
                                    }, stack)
                                    await msg.channel.send({
                                        embed: {
                                            color: Colors.ERROR,
                                            description: `Sorry, I couldn't get stats for this video.`,
                                            footer: {
                                                text: `We might have exceeded our API key quota.`
                                            }
                                        }
                                    })
                                }
                                break;
                            case `youtube#channel`:
                                try {
                                    const { data: chData } = await get(`https://www.googleapis.com/youtube/v3/channels`, {
                                        params: {
                                            part: "statistics",
                                            id: item.id.channelId,
                                            key: auth.keys.googleAPI
                                        },
                                        headers: {
                                            "Accept": "application/json"
                                        }
                                    })
                                    await msg.channel.send({
                                        embed: {
                                            thumbnail: {
                                                url: item.snippet.thumbnails.high.url
                                            },
                                            color: Colors.YOUTUBE,
                                            url: `https://www.youtube.com/channel/${item.id.channelId}`,
                                            title: item.snippet.title,
                                            description: item.snippet.description,
                                            fields: [
                                                {
                                                    name: `Created:`,
                                                    value: `${publishedAt.format(serverDocument.config.date_format)}\n(${publishedAt.fromNow()})`,
                                                    inline: true
                                                },
                                                {
                                                    name: `Detailed Statistics:`,
                                                    value: `${formatNumber(chData.items[0].statistics.videoCount)} videos\n${!chData.items[0].statistics.hiddenSubscriberCount ? `${formatNumber(chData.items[0].statistics.subscriberCount)} subscribers` : `Unknown`}\n${formatNumber(chData.items[0].statistics.viewCount)} views`,
                                                    inline: true
                                                }
                                            ],
                                            footer: {
                                                text: `All information provided by YouTube Data API v3.`
                                            }
                                        }
                                    })
                                } catch ({ stack }) {
                                    this.client.log.error(`Failed to contact YouTube Data API for channel stats`, {
                                        svr_id: msg.guild.id,
                                        ch_id: msg.channel.id,
                                        usr_id: msg.author.id,
                                    }, stack)
                                    //Be nice and send them the channel result anyway
                                    await msg.channel.send(`https://www.youtube.com/channel/${item.id.channelId}`)
                                    await msg.channel.send({
                                        embed: {
                                            color: Colors.ERROR,
                                            description: `Sorry, I couldn't get stats for this channel.`,
                                            footer: {
                                                text: `We might have exceeded our API key quota.`
                                            }
                                        }
                                    })
                                }
                                break;
                            case `youtube#playlist`:
                                await msg.channel.send({
                                    embed: {
                                        color: Colors.YOUTUBE,
                                        author: {
                                            name: item.snippet.channelTitle
                                        },
                                        thumbnail: {
                                            url: item.snippet.thumbnails.high.url
                                        },
                                        url: `https://www.youtube.com/playlist?list=${item.id.playlistId}`,
                                        title: item.snippet.title,
                                        description: item.snippet.description,
                                        fields: [
                                            {
                                                name: `Created:`,
                                                value: `${publishedAt.format(serverDocument.config.date_format)} (${publishedAt.fromNow()})`,
                                                inline: true
                                            }
                                        ],
                                        footer: {
                                            text: `All information provided by YouTube Data API v3.`
                                        }
                                    }
                                })
                                break;
                        }
                    })
                } else {
                    await msg.channel.send({
                        embed: {
                            color: Colors.SOFT_ERROR,
                            description: `No results found for \`${suffix}\``
                        }
                    })
                }
            } catch ({ stack }) {
                this.client.log.error(`Failed to contact YouTube Data API`, {
                    svr_id: msg.guild.id,
                    ch_id: msg.channel.id,
                    usr_id: msg.author.id,
                }, stack)
                await msg.channel.send({
                    embed: {
                        color: Colors.ERROR,
                        description: `Sorry, I couldn't search YouTube.`,
                        footer: {
                            text: `We might have exceeded our API key quota.`
                        }
                    }
                })
            }
        }
    }
}