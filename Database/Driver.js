const { connect, model, models, connection} = require("mongoose")

const { serverSchema, userSchema } = require("./Schemas")

module.exports = class MongoDriver {
    constructor(bot) {
        this.bot = bot;
    }
    async initialize(url) {
        await connect(url, {
            connectTimeoutMS: 30000,
            socketTimeoutMS: 30000,
            keepAlive: 120,
            poolSize: 100,
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        
        model("servers", serverSchema)
        model("users", userSchema)

        connection.on("error", err => {
            this.bot.log.error(`An error occurred with the MongoDB connection`, err)
        })
        return models;
    }
    get = () => models
    getConnection = () => connection
}
