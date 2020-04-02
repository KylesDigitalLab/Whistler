const axios = require("axios")
const { UserAgent } = require("../../Internals/Constants");
const { tokens } = require("../../Config/auth.json");
const { gistKey } = tokens;

module.exports = class GistUploader {
    constructor(client) {
        this.client = client;
        this.public = gistKey === "";
        this.headers = {
            "User-Agent": UserAgent,
            Accept: "application/json",
            "Content-Type": "application/json",
        }
        if (gistKey !== "") {
            this.headers.Authorization = `Token ${gistKey}`;
        }
        this.url = "https://api.github.com/gists";
    }
    async upload({
        title = "",
        text,
        file = "text.md"
    } = {}) {
        const response = await axios.post(this.url, {
            description: `${this.client.user.username}`,
            public: this.public,
            files: {
                [file]: {
                    content: text
                },
            },
        }, {
            headers: this.headers
        })
        return {
            id: response.data.id,
            url: response.data.html_url,
            rawURL: response.data.files[file].raw_url
        }
    }
}