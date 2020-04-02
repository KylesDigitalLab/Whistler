const { Command } = require("../../Structures")
const wiki = require("wikijs").default()

module.exports = class WikiCommand extends Command {
    constructor(client) {
        super(client, {
            title: `wiki`,
            aliases: [`wikipedia`],
            description: "Searches Wikipedia.",
            category: `media`
        })
    }
    async run(msg, {
        Colors
    }, { }, suffix) {
        const m = await msg.channel.send({
            embed: {
                color: Colors.YELLOW,
                title: "📚 Hold on...",
                description: "We are searching Wikipedia...",
                footer: {
                    text: `This shouldn't take long!`
                }
            },
        });
        let result;
        if (!suffix) {
            result = await wiki.page(await wiki.random(1))
        } else {
            const search = await wiki.search(suffix, 1)
            if (search.results.length) {
                result = await wiki.page(search.results[0]);
            } else {
                return await m.edit({
                    embed: {
                        color: Colors.SOFT_ERROR,
                        title: "📚 Huh?",
                        description: "I couldn't find that on Wikipedia."
                    },
                });
            }
        }
        let description = await result.summary();
        if (description.length > 1850) {
            description = `${description.substring(0, 1850)}...`;
        }
        await m.edit({
            embed: {
                color: this.client.getEmbedColor(msg.guild),
                title: result.raw.title,
                url: result.raw.fullurl,
                description,
                image: {
                    url: await result.mainImage().catch(() => null),
                },
                footer: {
                    text: `Information provided by wikijs.`
                }
            },
        });
    }
}