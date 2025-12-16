const express = require('express');
const pool = require("../config/db");
const requireRole = require('../middleware/auth');
const router = express.Router()


router.use(requireRole(['Nhân viên', 'Quản lý']));

router.get('/selection', async (req, res) => {
    res.render('ejs/index.ejs', {
        contentToInclude:'action_select.ejs',
    })
})


router.get('/tao-hoa-don' , async (req, res) => {
    let [products] = await pool.query('SELECT * FROM `san_pham`');
    res.render('ejs/index.ejs', {
        contentToInclude:'invoice_form.ejs',
        san_pham: products
    })
})

router.post('/tao-hoa-don', async (req, res) => {
    const data = req.body;

    const [invoiceResult] = await pool.query('INSERT INTO `hoa_don` (`id_khach_hang`) VALUES (?)', [0]);
    const idHoaDon = invoiceResult.insertId;

    for (const item of data) {
        await pool.query(
            'INSERT INTO `hoa_don_chi_tiet` (`id_hoa_don`, `id_san_pham`, `so_luong`) VALUES (?, ?, ?)',
            [idHoaDon, item.id_san_pham, item.so_luong]
        );
    }

    res.json({ success: true, message: 'Thanh toán thành công' });
});


module.exports = router;