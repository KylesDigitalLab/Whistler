const { Command } = require("../../Structures")
const google = require("google-it")
const { auth } = require("../../Config")
const { get } = require("axios")
const PaginatedEmbed = require("../../Modules/MessageUtils/PaginatedEmbed")

module.exports = class GoogleCommand extends Command {
    constructor(client) {
        super(client, {
            title: "google",
            aliases: [`search`],
            description: "Searches Google.",
            usage: `<query>`,
            category: `media`
        })
    }
    async run(msg, {
        Colors
    }, { 
        serverDocument
    }, suffix) {
        if (suffix) {
            const m = await msg.channel.send({
                embed: {
                    color: Colors.YELLOW,
                    title: `Please wait...`,
                    description: `We are searching Google...`
                }
            })
            try {
                const { data } = await get(`https://www.googleapis.com/customsearch/v1`, {
                    params: {
                        q: encodeURIComponent(suffix.trim()),
                        cx: serverDocument.config.custom_api_keys.google_cse_id || auth.tokens.google_cse_id,
                        key: serverDocument.config.custom_api_keys.google_api_key || auth.tokens.google_api_key
                    }
                })
                if (data.items && data.items.length) {
                    let [titles, descriptions, urls, thumbnails] = [[], [], [], []]
                    for (const item of data.items) {
                        switch (item.kind) {
                            case "customsearch#result":
                                titles.push(item.title)
                                descriptions.push(item.snippet)
                                urls.push(item.link)
                                if (item.pagemap.cse_image) {
                                    let img = item.pagemap.cse_image[0].src
                                    if(img.startsWith("http://") || img.startsWith("https://")) {
                                        thumbnails.push(img)
                                    }
                                }
                                break;
                        }
                    }
                    await m.delete().catch(() => null)
                    await new PaginatedEmbed(this.client, msg, {
                        color: this.client.getEmbedColor(msg.guild),
                        footer: `Result {currentPage} out of {totalPages} | Results provided by Google CSE API v1.`
                    }, {
                        titles,
                        descriptions,
                        urls,
                        thumbnails
                    }).init()
                } else {
                    await msg.channel.send({
                        embed: {
                            color: Colors.SOFT_ERROR,
                            title: `⚠️ Warning:`,
                            description: `No results were found.`
                        }
                    })
                }
            } catch ({ stack }) {
                this.client.log.warn(`Failed to search Google`, {
                    svr_id: msg.guild.id,
                    msg_id: msg.id
                }, stack)
                if(!m.deleted) {
                    await m.delete().catch(() => null)
                }
                await msg.channel.send({
                    embed: {
                        color: Colors.ERROR,
                        title: `❌ Error:`,
                        description: `Something went wrong while trying to search Google.`
                    }
                })
            }
        } else {
            await msg.channel.send({
                embed: {
                    color: Colors.SOFT_ERROR,
                    title: `❌ Error:`,
                    description: `I need something to search for!`
                }
            })
        }
    }
}