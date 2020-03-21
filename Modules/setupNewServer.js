
module.exports = async(client, svr, serverDocument) => {
    svr.members.cache.forEach(member => {
        serverDocument.members.push({
            _id: member.id
        })
    })
    svr.channels.cache.forEach(ch => {
        serverDocument.channels.push({
            _id: ch.id
        })
    })
    svr.roles.cache.forEach(role => {
        serverDocument.roles.push({
            _id: role.id
        })
    })
    return serverDocument;
}