module.exports = class Event {
    /**
     * @param {*} bot 
     * @param {Object} data
     */
    constructor(bot, data) {
        Object.defineProperty(this, `bot`, {
            value: bot,
            enumerable: false,
            writeable: false
        });
        this.info = data;
    }
}