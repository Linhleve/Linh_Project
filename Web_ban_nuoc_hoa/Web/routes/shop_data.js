const express = require('express');
const pool = require("../config/db");
const router = express.Router()



router.get('/san-pham', async  (req, res) => {
    let[rows] = await  pool.query('SELECT * FROM `san_pham`');
    res.json(rows);

});

router.get('/tai-khoan', async (req, res) => {
    let[rows] = await  pool.query('SELECT * FROM `tai_khoan`');
    res.json(rows);
});



module.exports = router;