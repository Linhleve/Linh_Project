const express = require('express');
const pool = require("../config/db");
const router = express.Router()



router.post('/kiem-tra-dang-nhap', async  (req,res) => {

    const tai_khoan = req.body;
    let [rows] = await pool.query('SELECT * FROM `tai_khoan` WHERE `ten_tai_khoan` = ? AND `mat_khau` = ?', [tai_khoan.ten_tai_khoan, tai_khoan.mat_khau]);
    if (rows.length > 0) {
        req.session.user = rows[0]
        res.redirect('/trang-ca-nhan');
    } else {
        res.redirect('/dang-nhap');
    }
})

router.post('/dang-ky', async (req, res) => {
    const tai_khoan = req.body;
    if (!tai_khoan.ten_nguoi_dung || !tai_khoan.ten_tai_khoan || !tai_khoan.mat_khau || !tai_khoan.email) {
        return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc.' });
    }

    try {
        const [existingUser] = await pool.query('SELECT * FROM `tai_khoan` WHERE `ten_tai_khoan` = ? OR `email` = ?', [tai_khoan.ten_tai_khoan, tai_khoan.email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ success: false, message: 'Tên đăng nhập hoặc email đã tồn tại.' });
        }

        await pool.query('INSERT INTO `tai_khoan` (`ten_nguoi_dung`, `ten_tai_khoan`, `mat_khau`, `email`, `so_dien_thoai`) VALUES (?, ?, ?, ?, ?)',
            [tai_khoan.ten_nguoi_dung, tai_khoan.ten_tai_khoan, tai_khoan.mat_khau, tai_khoan.email, tai_khoan.so_dien_thoai]);
        
        res.status(201).json({ success: true, message: 'Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Đã có lỗi xảy ra phía máy chủ.' });
    }
});

router.post('/quen-mat-khau', async (req, res) => {
    const tai_khoan = req.body;
    try {
        let [taikhoan] = await pool.query('SELECT * FROM `tai_khoan` WHERE (`ten_tai_khoan` = ? AND `email` = ?) OR (`ten_tai_khoan` = ? AND `so_dien_thoai` = ?)' , [tai_khoan.ten_tai_khoan, tai_khoan.recovery,tai_khoan.ten_tai_khoan, tai_khoan.recovery]);
        if (taikhoan.length === 0) {
            res.json({ success: false, message: 'Không tìm thấy tài khoản với thông tin đã cung cấp.' });
        } else {
            res.json({ success: true, message: `Mật khẩu của bạn là: ${taikhoan[0].mat_khau}` });
        }


    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Có lỗi xảy ra,bạn hãy kiểm tra lại thông tin' });
    }
})



router.get('/kiem-tra-trang-thai/:url', (req, res) => {

    if (req.session.user) {
        res.redirect(`/${req.params.url}`);
    } else {
        res.redirect('/dang-nhap');
    }
})

router.get('/dang-xuat', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/trang-chu');
        }
    });
})


module.exports = router;