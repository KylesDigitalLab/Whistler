const { Router } = require('express');
const util = require("util")

const router = Router();

router.get(`/`, (req, res) => {
    res.send("Hello!")
})

router.get(`/eval`, (req, res) => {
    res.status(200).render("pages/maintainer-eval.ejs")
})

router.post(`/eval`, async(req, res) => {
    if(req.body.expression) {
        try {
            let result = await eval(req.body.expression)
            if(typeof result !== "string") {
                result = util.inspect(result)
            }
            res.send(result)
        } catch(err) {
            res.status(500).send(err.stack)
        }
    } else {
        res.status(400)
    }
})

module.exports = router;