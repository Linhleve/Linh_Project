const express = require('express');
const pool = require("../config/db");
const path = require("path");
const router = express.Router()


router.get('/partial/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, '../views/html', `${page}.html`);

    res.sendFile(filePath);
});

router.get('/', (req, res) => {
    res.redirect('/trang-chu');
})

router.get('/:page', (req, res) => {
    res.sendFile(path.join(__dirname, `../views/html/index.html`))
})


router.get('/san-pham/:id', async (req, res) => {
    const id = req.params.id;
    let [rows] = await pool.query('SELECT * FROM `san_pham` WHERE `id_san_pham` = ?', [id]);
    res.render('ejs/index.ejs', {
        contentToInclude: 'san-pham.ejs',
        san_pham: rows[0]
    })
})



module.exports = router;