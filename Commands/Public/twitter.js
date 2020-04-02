const getRSS = require("../../Modules/Utils/RSS");
const PaginatedEmbed = require("../../Modules/MessageUtils/PaginatedEmbed");
const moment = require("moment");

const { Command } = require("../../Structures")

module.exports = class Twitter extends Command {
    constructor(client) {
        super(client, {
            title: "twitter",
            aliases: [`tweets`],
            description: "Gets tweets for a user.",
            usage: `<user>`,
            category: `media`
        })
    }
    async run(msg, {
        Colors,
        APIs
    }, { }, suffix) {
        if (suffix) {
            if (suffix.startsWith("@")) {
                suffix = suffix.slice(1);
            }
            let query = suffix.substring(0, suffix.lastIndexOf(" "));
            let num = suffix.substring(suffix.lastIndexOf(" ") + 1);
            if (!query || isNaN(num)) {
                query = suffix;
                num = 5;
            }
            const m = await msg.channel.send({
                embed: {
                    color: Colors.TWITTER,
                    title: `🐦 Hold on..`,
                    description: `We're getting the tweets...`,
                    footer: {
                        text: `This shouldn't take long...`
                    }
                }
            });

            const tweets = await getRSS(APIs.TWITRSS(query), num).catch(async err => {
                if (err === "invalid") {
                    return [];
                } else {
                    await m.edit({
                        embed: {
                            color: Colors.ERROR,
                            title: `❌ Oh No!`,
                            description: `Something went wrong while contacting TwitRSS.`
                        }
                    })
                }
            });
            if (tweets.length) {
                const authors = [];
                const authorUrls = [];
                const descriptions = [];
                const timestamps = [];
                for(const t of tweets) {
                    authors.push(t.creator)
                    authorUrls.push(t.link)
                    descriptions.push(t.contentSnippet);
                    timestamps.push(t.isoDate)
                }
                await m.delete().catch(() => null);
                await new PaginatedEmbed(this.client, msg, {
                    color: Colors.TWITTER,
                    footer: `🐦 Tweet {currentPage} out of {totalPages} | Information provided by TwitRSS`
                }, {
                    authors,
                    authorUrls,
                    descriptions,
                    timestamps,
                }).init()
            } else {
                await m.edit({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        author: {
                            name: this.client.user.username
                        },
                        description: `I couldn't find that user.`,
                        footer: {
                            text: `🐦 Here's a birb anyways`
                        }
                    }
                })
            }
        } else {
            await msg.channel.send({
                embed: {
                    color: Colors.SOFT_ERROR,
                    title: `Tweet what?`,
                    description: `I don't know who to get tweets for!`,
                    footer: {
                        text: `🐦 Here's a birb anyways`
                    }
                }
            })
        }
    }
}