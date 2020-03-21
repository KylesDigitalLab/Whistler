module.exports = class Event {
    /**
     * @param {*} client 
     * @param {Object} data
     */
    constructor(client, data) {
        Object.defineProperty(this, `client`, {
            value: client,
            enumerable: false,
            writeable: false
        });
        this.data = data;
    }
}