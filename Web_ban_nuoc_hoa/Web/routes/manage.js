const express = require('express');
const pool = require("../config/db");
const requireRole = require('../middleware/auth');
const router = express.Router()



router.use(requireRole(['Quản lý']));

router.get('/cua_hang', async (req, res) => {
    res.render('ejs/index.ejs', {
        contentToInclude:'manage_layout.ejs',
    })
})


module.exports = router;