module.exports = class Command {
    constructor(bot, data) {
        Object.defineProperty(this, `bot`, {
            value: bot,
            enumerable: false,
            writeable: false
        });
        
        this.info = data
    }
}