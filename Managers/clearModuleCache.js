module.exports = moduleId => {
    const fullPath = require.resolve(moduleId);

    if (require.cache[fullPath] && require.cache[fullPath].parent) {
        let i = require.cache[fullPath].parent.children.length;

        while (i -= 1) {
            if (require.cache[fullPath].parent.children[i].id === fullPath) {
                require.cache[fullPath].parent.children.splice(i, 1);
            }
        }
    }

    delete require.cache[fullPath];
}