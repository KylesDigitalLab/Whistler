const moment = require("moment")

module.exports = class ModLog {
    constructor() {
        throw new Error(`STATIC_CLASS`)
    }
    static async createEntry(client, svr, entry) {
        const serverDocument = svr.serverDocument || await svr.populateDocument()
        if(!serverDocument) {
            throw new Error(`SERVER_DOCUMENT_NOT_FOUND`)
        }
        if(!serverDocument.config.moderation.log.enabled) {
            return;
        }
        const timestamp = Date.now()
        const ch = svr.channels.cache.get(serverDocument.config.moderation.log.channel_id)
        if(!ch) {
            throw new Error(`INVALID_MODLOG_CHANNEL`)
        }
        const m = await ch.send({
            embed: {
                color: client.getEmbedColor(svr),
                title: `🛠️ Case ${serverDocument.config.moderation.log.current_case + 1}:`,
                description: `🔨 **Action:** ${entry.action}
                👤 **User:** ${entry.user.tag}
                👮 **Moderator:** ${entry.moderator.tag}
                ❓ **Reason:** ${entry.reason}`,
                footer: {
                    text: `${svr.formatDate(timestamp)}`
                }
            }
        })
        serverDocument.config.moderation.log.cases.push({
            _id: serverDocument.config.moderation.log.current_case + 1,
            timestamp: timestamp,
            action: entry.action,
            user_id: entry.user.id,
            moderator_id: entry.moderator.id,
            message_id: m.id,
            reason: entry.reason
        })
        serverDocument.config.moderation.log.current_case++;
    }
}