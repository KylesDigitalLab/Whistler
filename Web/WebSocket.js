const express = require(`express`)
const { renderFile } = require("ejs")
const { join } = require("path")

module.exports = class WebSocket {
    constructor(bot) {
        Object.defineProperty(this, `bot`, {
            value: bot,
            enumerable: false
        });
        this.app = express();
        this.app.use((req, res, next) => {
            this.bot.log.debug(`Received ${req.method} request at ${req.originalUrl} from ${req.ip}`, {
                params: req.params,
                query: req.query,
                body: req.body
            })
            next();
        })
        this.app.engine("ejs", renderFile);
        this.app.set("views", `${__dirname}/views`);
        this.app.set("view engine", "ejs");
        this.app.use(`/public`, express.static(`${__dirname}/public`))
        this.app.get(`/`, (req, res) => {
            res.status(200).render("pages/landing.ejs", {
                bot: this.bot
            })
        })
        this.server = this.app.listen(8080, () => this.bot.log.info(`Websocket listening on port ${this.server.address().port}`))
    }
}