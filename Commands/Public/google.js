const { Command } = require("../../Structures")
const google = require("google-it")
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
    }, {}, suffix) {
        if (suffix) {
            const m = await msg.channel.send({
                embed: {
                    color: Colors.YELLOW,
                    title: `Please wait...`,
                    description: `We are searching Google...`
                }
            })
            const items = await google({
                query: suffix,
                disableConsole: true
            }).catch(err => {
                this.client.log.error(`Failed to search Google`, {
                    svr_id: msg.guild.id,
                    msg_id: msg.id
                }, err)
                msg.channel.send({
                    embed: {
                        color: Colors.ERROR,
                        title: `❌ Error:`,
                        description: `Something went wrong while trying to search Google.`
                    }
                })
            })
            if (items.length) {
                let [titles, descriptions, urls] = [[], [], []];
                for(const i of items) {
                    titles.push(i.title)
                    descriptions.push(i.snippet)
                    urls.push(i.link)
                }
                await m.delete().catch(() => null)
                await new PaginatedEmbed(this.client, msg, {
                    color: this.client.getEmbedColor(msg.guild),
                    footer: `Result {currentPage} out of {totalPages} | Results provided by google-it`
                }, {
                    titles,
                    descriptions,
                    urls
                }).init()
            } else {
                msg.channel.send({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        title: `⚠️ Warning:`,
                        description: `No results were found for '${suffix}'`
                    }
                })
            }
        } else {
            msg.channel.send({
                embed: {
                    color: Colors.ERROR,
                    title: `❌ Error:`,
                    description: `I need something to search for!`
                }
            })
        }
    }
}