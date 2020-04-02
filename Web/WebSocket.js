const express = require(`express`)
const { renderFile } = require("ejs")
const { join } = require("path")
const passport = require("passport");
const bodyParser = require('body-parser');
const { Strategy } = require("passport-discord")
const session = require("express-session");

const dashboard = require(`./routes/dashboard`)
const maintainer = require(`./routes/maintainer`)
const api = require(`./routes/api`)

const { auth, config } = require("../Config")

module.exports = class WebSocket {
    constructor(client) {
        this.discordOAuthScopes = ["identify", "guilds", "email"];
        Object.defineProperty(this, `client`, {
            value: client,
            enumerable: false
        });
        this.app = express();
        passport.use(new Strategy({
            clientID: auth.discord.clientID,
            clientSecret: auth.discord.clientSecret,
            callbackURL: `${config.web_url}/login/callback`,
            scope: this.discordOAuthScopes,
        }, (accessToken, refreshToken, profile, done) => {
            process.nextTick(() => done(null, profile));
        }));

        passport.serializeUser((user, done) => {
            done(null, user);
        });
        passport.deserializeUser((id, done) => {
            done(null, id)
        });
        this.app.enable('trust proxy')
            .set('json spaces', 2)
            .use(session({
                secret: `HJkIgiJ6nxdpXVRfzsl472yzsKn`,
                resave: true,
                saveUninitialized: true,
                proxy: true,
            }))
            .use(passport.initialize())
            .use(passport.session())
            .use(bodyParser.urlencoded({
                extended: false,
            }))
            .use((req, res, next) => {
                this.client.log.debug(`Incoming ${req.protocol} ${req.method} on ${req.path} from ${req.connection.remoteAddress}`, { 
                    params: req.params, 
                    query: req.query, 
                    protocol: req.protocol, 
                    method: req.method, 
                    path: req.path, 
                    useragent: req.header("User-Agent") })
                next();
            })
            .use(`/public`, express.static(`${__dirname}/public`))

        this.app.passport = passport;

        this.app.engine("ejs", renderFile);
        this.app.set("views", `${__dirname}/views`);
        this.app.set("view engine", "ejs");
        this.app.get(`/`, (req, res) => {
            res.status(200).render("pages/landing.ejs", {
                botClient: this.client
            })
        })

        this.app.get(`/me`, (req, res) => {
            if (req.isAuthenticated()) {
                res.json(req.user);
            } else {
                res.redirect(`/login`)
            }
        })

        this.app.get("/login", passport.authenticate("discord", {
            scope: this.discordOAuthScopes
        }));

        this.app.get(`/403`, (req, res) => res.sendStatus(403))

        this.app.get("/login/callback", passport.authenticate("discord", {
            failureRedirect: "/error"
        }), (req, res) => {
            if (!req.user.verified) {
                res.redirect("/error");
            } else {
                res.redirect("/dashboard");
            }
        })
        this.app.use(`/dashboard`, this.checkAuth, dashboard)
            .use(`/maintainer`, this.checkMaintainer, maintainer)
            .use(`/api`, this.checkAuth, api)
            
        this.server = this.app.listen(8080, () => this.client.log.info(`Websocket listening on port ${this.server.address().port}`))
    }
    checkAuth(req, res, next) {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect(`/login`)
        }
    }
    checkMaintainer(req, res, next) {
        if (req.isAuthenticated()) {
            if (config.maintainers.includes(req.user.id)) {
                next();
            } else {
                res.sendStatus(403)
            }
        } else {
            res.redirect(`/login`)
        }
    }
}