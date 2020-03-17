
module.exports = (bot, svr, serverData) => new Promise((resolve, reject) => {
    svr.members.cache.forEach(member => {
        serverData.members.push({
            _id: member.id
        })
    })
    svr.roles.cache.forEach(role => {
        serverData.roles.push({
            _id: role.id
        })
    })
    resolve(serverData)
})