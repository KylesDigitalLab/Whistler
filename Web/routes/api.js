const { Router } = require('express');
const util = require("util")

const client = require('../../index');

const router = Router();

router.get(`/servers/:id`, (req, res) => {
    const svr = client.guilds.cache.get(req.body.id)
    if(svr) {
        res.json({
            name: svr.name
        })
    } else {
        res.send(404)
    }
})

module.exports = router;