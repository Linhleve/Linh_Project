const express = require('express');
const pool = require("../config/db");
const router = express.Router()



router.get('/lich-su-mua-hang', async  (req, res) => {
    let[rows] = await  pool.query('SELECT * FROM `hoa_don` WHERE `id_khach_hang` = ?', [req.session.user.id_tai_khoan]);
    res.json(rows);

});

router.get('/chi-tiet-hoa-don/:id', async (req, res) => {
    const idHoaDon = req.params.id;
    let [rows] = await pool.query('SELECT * FROM `hoa_don_chi_tiet` where `id_hoa_don` = ?', [idHoaDon]);
    if (rows.length === 0) {
        res.status(404).json({ success: false, message: 'Không tìm thấy hóa đơn' });
        return;
    }
    res.json(rows);
})


router.get('/thong-tin-tai-khoan', async (req, res) => {
    let [[rows]] = await pool.query('SELECT * FROM `tai_khoan` WHERE `id_tai_khoan` = ?', [req.session.user.id_tai_khoan]);
    res.json(rows);
});

router.post('/cap-nhat-tai-khoan', async (req, res) => {
    const tai_khoan = req.body;
    await pool.query('UPDATE `tai_khoan` SET `ten_nguoi_dung` = ?, `email` = ?, `so_dien_thoai` = ? , `dia_chi` = ? WHERE `id_tai_khoan` = ? ',
        [tai_khoan.ten_tai_khoan, tai_khoan.email, tai_khoan.so_dien_thoai, tai_khoan.dia_chi, req.session.user.id_tai_khoan]);
    res.redirect('/trang-ca-nhan');
})

router.put('/doi-mat-khau', async (req, res) => {
    const {mat_khau_cu, mat_khau_moi} = req.body;
    let [[user]] = await pool.query('SELECT * FROM `tai_khoan` WHERE `id_tai_khoan` = ?', [req.session.user.id_tai_khoan]);

    if (user.mat_khau !== mat_khau_cu) {
        res.json({success: false, message: 'Mật khẩu cũ không đúng'});
        return;
    }

    await pool.query('UPDATE `tai_khoan` SET `mat_khau` = ? WHERE `id_tai_khoan` = ?', [mat_khau_moi, req.session.user.id_tai_khoan]);
    res.json({success: true, message: 'Đổi mật khẩu thành công'});
})



router.get('/gio-hang', async (req, res) => {
    let [rows] = await pool.query('SELECT gio_hang.id_san_pham, san_pham.ten_san_pham, san_pham.gia_ban, gio_hang.so_luong_san_pham FROM `gio_hang` JOIN san_pham ON gio_hang.id_san_pham = san_pham.id_san_pham WHERE `id_tai_khoan` = ?',
        [req.session.user.id_tai_khoan]);
    res.json(rows);
})


router.post('/them-vao-gio-hang', async (req, res) => {
    const {id_san_pham} = req.body;

    if (req.session.user) {
        let [rows] = await pool.query('SELECT * FROM `gio_hang` WHERE `id_tai_khoan` = ? AND `id_san_pham` = ?', [req.session.user.id_tai_khoan, id_san_pham]);
        if (rows.length > 0) {
            res.json({ success: true, message: 'Sản phẩm đã có trong giỏ hàng' });
        } else {
            await pool.query('INSERT INTO `gio_hang` (`id_tai_khoan`, `id_san_pham`) VALUES (?, ?)', [req.session.user.id_tai_khoan, id_san_pham]);
            res.json({ success: true, message: 'Thêm sản phẩm vào giỏ hàng thành công' });
        }
    }
    else {
        res.json({ success: false });
    }
})


router.put('/cap-nhat-so-luong', async (req, res) => {
    const { id_san_pham, so_luong } = req.body;
    if (so_luong <= 0) {
        await pool.query('DELETE FROM `gio_hang` WHERE `id_tai_khoan` = ? AND `id_san_pham` = ?', [req.session.user.id_tai_khoan, id_san_pham]);
    }
    else {
        await pool.query('UPDATE `gio_hang` SET `so_luong_san_pham` = ? WHERE `id_tai_khoan` = ? AND `id_san_pham` = ?', [so_luong, req.session.user.id_tai_khoan, id_san_pham]);
    }
    res.json({ success: true });
})


router.put('/thanh-toan', async (req, res) => {
    let [user] = await pool.query('SELECT * FROM `tai_khoan` WHERE `id_tai_khoan` = ?', [req.session.user.id_tai_khoan]);
    const { tong_tien } = req.body;
    let [gioHang] = await pool.query('SELECT * FROM `gio_hang` WHERE `id_tai_khoan` = ?', [req.session.user.id_tai_khoan]);
    if (user[0].so_du < tong_tien) {
        res.json({ success: false, message: 'Số dư không đủ để thanh toán' });
        return;
    }
    const [invoiceResult] = await pool.query('INSERT INTO `hoa_don` (`id_khach_hang`) VALUES (?)', [req.session.user.id_tai_khoan]);
    const idHoaDon = invoiceResult.insertId;

    for (const item of gioHang) {
        await pool.query(
            'INSERT INTO `hoa_don_chi_tiet` (`id_hoa_don`, `id_san_pham`, `so_luong`) VALUES (?, ?, ?)',
            [idHoaDon, item.id_san_pham, item.so_luong_san_pham]
        );
    }

    await pool.query('DELETE FROM `gio_hang` WHERE `id_tai_khoan` = ?', [req.session.user.id_tai_khoan]);
    res.json({ success: true, message: 'Thanh toán thành công' });

    [user] = await pool.query('SELECT * FROM `tai_khoan` WHERE `id_tai_khoan` = ?', [req.session.user.id_tai_khoan]);

})

router.put('/nap-tien', async (req, res) => {
    const { so_tien } = req.body;
    if (so_tien <= 0) {
        res.json({ success: false, message: 'Số tiền nạp không hợp lệ' });
        return;
    }

    await pool.query('INSERT INTO `nap_tien` (`id_tai_khoan`, `so_tien`) VALUES (?, ?);', [req.session.user.id_tai_khoan, so_tien]);


    let [user] = await pool.query('SELECT * FROM `tai_khoan` WHERE `id_tai_khoan` = ?', [req.session.user.id_tai_khoan]);
    req.session.user = user[0];
    res.json({ success: true, message: 'Nạp tiền thành công' });
})



module.exports = router;