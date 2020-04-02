const Parser = require("rss-parser");
const { UserAgent } = require("../../Internals/Constants");
const parser = new Parser({ 
    timeout: 2000, 
    headers: { 
        "User-Agent": UserAgent 
    } 
});

module.exports = (url, num) => new Promise((resolve, reject) => parser.parseURL(url)
.then(articles => resolve(articles && articles.items ? articles.items.slice(0, num) : []))
.catch(err => reject("invalid")))