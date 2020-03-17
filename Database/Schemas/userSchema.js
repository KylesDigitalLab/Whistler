const { FindOrCreateSchema } = require("./../../Structures")

module.exports = new FindOrCreateSchema({
    _id: {
        type: String
    },
    last_active: {
        type: Date
    },
    location: {
        type: String
    }
})