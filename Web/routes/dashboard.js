const { Router } = require('express');
const util = require("util")

const client = require('../../index');

const router = Router();

router.get(`/`, (req, res) => {
    res.render(`pages/dashboard.ejs`, {
        botClient: client,
        user: req.user
    })
})

module.exports = router;