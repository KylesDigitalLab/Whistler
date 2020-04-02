
module.exports = async (client, svr, serverDocument) => {
    svr.members.cache.forEach(member => {
        serverDocument.members.push({
            _id: member.id
        })
    })
    svr.channels.cache.forEach(ch => {
        switch (ch.type) {
            case "text":
                serverDocument.channels.text.push({
                    _id: ch.id
                })
                break;
            case "voice":
                serverDocument.channels.voice.push({
                    _id: ch.id
                })
                break;
            case "category":
                serverDocument.channels.category.push({
                    _id: ch.id
                })
                break;
        }
    })
    svr.roles.cache.forEach(role => {
        serverDocument.roles.push({
            _id: role.id
        })
    })
    return serverDocument;
}