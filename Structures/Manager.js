module.exports = class Manager {
    constructor(bot) {
        Object.defineProperty(this, `bot`, {
            value: bot,
            enumerable: false,
            writable: false
        })
    }
}