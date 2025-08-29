const express = require('express')
const route = express.Router()

route.get('/', (req,res) => {
    res.sendFile('/index.html')
})

module.exports = route;