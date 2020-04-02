const { Colors, PageEmojis } = require("../../Internals/Constants")
const wait = t => new Promise(r => setTimeout(r, t))

module.exports = class PaginatedEmbed {
	constructor(client, msg, embedTemplate, {
		contents = [],
		authors = [],
		authorUrls = [],
		titles = [],
		colors = [],
		urls = [],
		descriptions = [],
		fields = [],
		timestamps = [],
		thumbnails = [],
		images = [],
		footers = [],
		pageCount = null,
	} = {}) {
		this.client = client;
		this.msg = msg;

		this.contents = contents;
		this.authors = authors;
		this.authorUrls = authorUrls;
		this.titles = titles;
		this.colors = colors;
		this.urls = urls;
		this.descriptions = descriptions;
		this.fields = fields;
		this.timestamps = timestamps;
		this.thumbnails = thumbnails;
		this.images = images;
		this.footers = footers;

		this.currentPage = 0;
		this.totalPages = pageCount || this.descriptions.length;

		this.messageTemplate = Object.assign({
			content: "{content}",
			author: "{author}",
			authorIcon: null,
			authorUrl: null,
			title: "{title}",
			color: Colors.INFO,
			url: null,
			description: "{description}",
			fields: null,
			timestamp: null,
			thumbnail: null,
			image: null,
			footer: "{footer}Page {currentPage} out of {totalPages}",
			footerIcon: null,
		}, embedTemplate);
	}
	async init() {
		this.m = await this.msg.channel.send(this.currentMessageContent)
		await this.sendReactions()
	}
	async sendReactions() {
		await this.m.react(PageEmojis.START)
		await this.m.react(PageEmojis.BACK)
		await this.m.react(PageEmojis.STOP)
		await this.m.react(PageEmojis.FORWARD)
		await this.m.react(PageEmojis.END)
		await this.startCollector();
	}
	async startCollector() {
		this.collector = this.m.createReactionCollector((r, user) => user.id === this.msg.author.id && Object.values(PageEmojis).includes(r.emoji.name), {
			time: 60000
		})
		this.collector.on(`collect`, async r => {
			r.users.remove(this.msg.author).catch(() => null)
			switch (r.emoji.name) {
				case PageEmojis.START:
					if (this.currentPage === 0) return;
					this.currentPage = 0;
					await this.editMessage(this.currentMessageContent)
					break;
				case PageEmojis.BACK:
					if (this.currentPage === 0) return;
					this.currentPage--;
					await this.editMessage(this.currentMessageContent)
					break;
				case PageEmojis.STOP:
					this.collector.stop(`Requested by user.`);
					break;
				case PageEmojis.FORWARD:
					if (this.currentPage == this.totalPages - 1) return;
					this.currentPage++;
					await this.editMessage(this.currentMessageContent)
					break;
				case PageEmojis.END:
					if (this.currentPage == this.totalPages - 1) return;
					this.currentPage = this.totalPages - 1;
					await this.editMessage(this.currentMessageContent)
					break;
			}
		})
		this.collector.once(`end`, async (collection, reason) => {
			await this.m.reactions.removeAll()
				.catch(() => this.m.reactions.filter(r => r.me)
					.forEach(r => r.remove()))
			this.collector = null;
		})
	}
	async editMessage(content) {
		this.m = await this.m.edit(content)
	}
	get currentMessageContent() {
		return {
			content: this.messageTemplate.content.format(this.getFormatOptions({ content: this.contents[this.currentPage] || "" })),
			embed: {
				author: {
					name: this.messageTemplate.author.format(this.getFormatOptions({ author: this.authors[this.currentPage] || "" })),
					icon_url: this.messageTemplate.authorIcon,
					url: this.authorUrls[this.currentPage] || this.messageTemplate.authorUrl,
				},
				title: this.messageTemplate.title.format(this.getFormatOptions({ title: this.titles[this.currentPage] || "" })),
				color: this.colors[this.currentPage] || this.messageTemplate.color,
				url: this.urls[this.currentPage] || this.messageTemplate.url,
				description: this.messageTemplate.description.format(this.getFormatOptions({ description: this.descriptions[this.currentPage] || "" })),
				fields: this.fields[this.currentPage] || this.messageTemplate.fields,
				timestamp: this.timestamps[this.currentPage] || this.messageTemplate.timestamp,
				thumbnail: {
					url: this.thumbnails[this.currentPage] || this.messageTemplate.thumbnail,
				},
				image: {
					url: this.images[this.currentPage] || this.messageTemplate.image,
				},
				footer: {
					text: this.messageTemplate.footer.format(this.getFormatOptions({ footer: this.footers[this.currentPage] || "" })),
					icon_url: this.messageTemplate.footerIcon,
				},
			},
		};
	}
	getFormatOptions(obj) {
		return Object.assign({
			currentPage: this.currentPage + 1, 
			totalPages: this.totalPages 
		}, obj);
	}
}