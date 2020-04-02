const { post } = require("axios")

module.exports = async text => {
    if(!text) {
        throw new Error(`No text provided.`)
    }
    const reponse = await post(`https://hastebin.com/documents`, {
        data: text
    })
    return reponse.data;
}