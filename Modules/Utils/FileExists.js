const fs = require("fs")

module.exports = path => fs.promises.access(path).then(() => true).catch(() => false);