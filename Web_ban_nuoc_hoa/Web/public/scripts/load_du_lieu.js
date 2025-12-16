// Trang bộ sưu tập
function LoadSanPham(phanLoai = null) {
    fetch('shop-data/san-pham')
        .then(res => res.json())
        .then(data => {
            if (phanLoai) {
                data = data.filter(sanPham => sanPham.phan_loai === phanLoai);
            }
            HienThiSanPham(data)
        })
        .catch(error => {
            console.error(error);
        });
}
function HienThiSanPham(data) {
    let listProduct = document.getElementById('listProduct');
    listProduct.innerHTML = ``
    data.forEach(sanPham => {
        listProduct.innerHTML += `
    <li class="product-card width20">
            <div class="" onclick="changeURL('/san-pham/${sanPham.id_san_pham}')">
                <br>
                <a>
                    <img class="product-img " src="../images/products/${sanPham.id_san_pham}.png" alt="">
                </a>
            </div>
            <div class="product-content">
            <br>
                <h3 class="hover-red">${sanPham.ten_san_pham}</h3><br>
                <p class="hover-red">${Number(sanPham.gia_ban).toLocaleString('vi-VN')} vnđ</p>
            </div>
        </li>
    `
    });
}



// Trang cá nhân
function LoadTrangCaNhan(update = false) {
    fetch('user-data/thong-tin-tai-khoan')
        .then(res => res.json())
        .then(data => {
            if (update) {
                FormDoiThongTin(data)
            } else {
            HienThiTrangCaNhan(data)
            }
        })
        .catch(error => {
            console.error(error);
            changeURL('/dang-nhap')
        });
}
function HienThiTrangCaNhan(data) {
    let userInfo = document.getElementById('content');
    userInfo.innerHTML = `
        <h2>Thông tin cá nhân</h2>
        <br>
        <p>Tên: ${data.ten_nguoi_dung}</p>
        <p>Số dư tài khoản: ${data.so_du.toLocaleString('vi-VN')} VND</p>
        <p>Email: ${data.email}</p>
        <p>Số điện thoại: ${data.so_dien_thoai}</p>
        <p>Địa chỉ: ${data.dia_chi}</p>
        <button class="button" onclick="LoadTrangCaNhan(true)">Cập nhật thông tin</button>
    `;
    if (data.vai_tro !== 'Khách hàng') {
        userInfo.innerHTML += `<br><div class="form-1 b-hover-yellow" onclick="changeURL('/nhan-vien/selection')">
            <p class="f20">Vào trang quản lí</p>
        </div>`;
    }

}

function FormDoiThongTin(data) {
    let userInfo = document.getElementById('content');
    userInfo.innerHTML = `
        <h2>Thông tin cá nhân</h2>
        <br>
        <div class="container full-width">
            <form class="width85" action="/user-data/cap-nhat-tai-khoan" method="POST">
            <label class="f20">Tên:</label>
            <br>
            <input class="form-2 width60" name="ten_tai_khoan" type="text" value="${data.ten_nguoi_dung}">
            <br>
            <label class="f20">Email:</label>
            <br>
            <input class="form-2 width60" name="email" type="text" value="${data.email}">
            <br>
            <label class="f20">Số điện thoại: </label>
            <br>
            <input class="form-2 width60" name="so_dien_thoai" type="text" value="${data.so_dien_thoai}">
            <br>
            <label class="f20">Địa chỉ: </label>
            <br>
            <input class="form-2 width60" name="dia_chi" type="text" value="${data.dia_chi}">
            <br><br>
            <button class="button" type="submit"">Xác nhận</button>
        </form>
        </div>
    `;
}

function NapTien() {
    let tien = prompt('Nhập số tiền bạn muốn nạp vào tài khoản:', '0')
    fetch('user-data/nap-tien', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ so_tien: Number(tien) })
    })
        .then(res=> res.json())
        .then(data => {
            alert(data.message);
            LoadTrangCaNhan()
        })
    .catch(error => {console.log(error)})

}
function lichSuMuaHang() {
    fetch('user-data/lich-su-mua-hang')
        .then(res => res.json())
        .then(data => {
            hienThiLichSuMuaHang(data)
        })
        .catch(error => {
            console.error(error);
        });
}

function hienThiLichSuMuaHang(data) {
    let lichSu = document.getElementById('content');
    lichSu.innerHTML = `
        <h2>Lịch sử mua hàng</h2><br>
        <table class="table-1" id="listLichSu">
            <tr>
                <th class="width20">Ngày mua</th>
                <th class="width20">Tổng tiền</th>
            </tr>
        </table>
    `;
    let listLichSu = document.getElementById('listLichSu');
    data.forEach(item => {
        listLichSu.innerHTML += `
            <tr onclick="XemChiTietHoaDon(${item.id_hoa_don})">
                <td>${item.thoi_gian}</td>
                <td>${Number(item.tong_tien).toLocaleString('vi-VN')} VND</td>
            </tr>
        `
    });


}

function XemChiTietHoaDon(idHoaDon) {
    fetch(`user-data/chi-tiet-hoa-don/${idHoaDon}`)
        .then(res => res.json())
        .then(data => {
            HienThiChiTietHoaDon(data);
        })
        .catch(error => {
            console.error(error);
        });
}

function HienThiChiTietHoaDon(data) {
    let chiTiet = document.getElementById('content');
    chiTiet.innerHTML = ''
    data.forEach(item => {
        console.log(item)
        chiTiet.innerHTML += `
            <div class="full-width container">
                <div class="width10">
                    <img src="../images/products/${item.id_san_pham}.png" class="product-img" alt="">
                </div>

                <div class="width50">
                    <p class="f28">Số lượng: ${item.so_luong}</p>
                </div>
            </div>

`
    })
}

function FormDoiMatKhau(){
    let doiMK = document.getElementById('content');
    doiMK.innerHTML = `
        <h2>Đổi mật khẩu</h2>
        <br>
        <div class="container full-width">
            <form class="width85" action="/user-data/doi-mat-khau" method="POST">
                <label class="f20">Mật khẩu cũ</label>
                <br>
                <input class="form-2 width60" name="mat_khau_cu" type="password" required>
                <br>
                <label class="f20">Mật khẩu mới</label>
                <br>
                <input class="form-2 width60" name="mat_khau_moi" type="password" required>
                <br>
                <br><br>
                <button class="button" type="submit">Xác nhận</button>
            </form>
        </div>
    `;
}

// Giỏ hàng
function loadGioHang() {
    fetch('user-data/gio-hang')
        .then(res => res.json())
        .then(data => {
            HienThiGioHang(data)
        })
        .catch(error => {
            console.error(error);
        });
}

function HienThiGioHang(data) {
    let gioHang = document.getElementById('content');
    gioHang.innerHTML = ``;

    if (data.length === 0) {
        gioHang.innerHTML += `<p>Giỏ hàng của bạn hiện đang trống.</p>`;
        return;
    }

    data.forEach(item => {
        if (item.so_luong_san_pham) {
            gioHang.innerHTML += `
            <li class="full-width container form-1">
                <div class="width10">
                    <img src="../images/products/${item.id_san_pham}.png" class="product-img" alt="">
                </div>
                <div class="width50">
                    <p class="f28">${item.ten_san_pham}</p>
                </div>
                <div class="width10">
                    <p class="f28">${item.gia_ban.toLocaleString('vi-VN')} VND</p>
                </div>
                <div class="width20">
                    <button class="f28 button" onclick="CapNhatSoLuong(${item.id_san_pham},(${item.so_luong_san_pham} -1))">-</button>
                    <a class="f28 form-2">${item.so_luong_san_pham}</a>
                    <button class="f28 button" onclick="CapNhatSoLuong(${item.id_san_pham},(${item.so_luong_san_pham} + 1))">+</button>
                </div>
                <div class="width10">
                    <button class="f28 button" onclick="CapNhatSoLuong(${item.id_san_pham}, 0)">Xóa</button>
                </div>
            <li>
        `;
        }
    });
    let tongTien = data.reduce((tong, item) => tong + (item.gia_ban * item.so_luong_san_pham), 0);

    gioHang.innerHTML += `<p class="f28">Tổng tiền: ${tongTien.toLocaleString('vi-VN')} VND</p>`;
}
function CapNhatSoLuong(idSanPham, thayDoi) {
    fetch('user-data/cap-nhat-so-luong', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id_san_pham: idSanPham,
            so_luong: thayDoi
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                loadGioHang();
            }
        })
        .catch(error => {
            console.error('Lỗi cập nhật:', error);
        });

}

function ThemVaoGioHang(idSanPham) {
    fetch('/user-data/them-vao-gio-hang', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_san_pham: idSanPham })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
            } else {
                if (confirm('Hãy đăng nhập để thêm sản phẩm vào giỏ hàng.')) {
                    changeURL('/dang-nhap');
                }
            }
        })
        .catch(error => {
            console.log(error)
        });
}


function ThanhToan() {
    fetch('user-data/gio-hang')
        .then(res => res.json())
        .then(data => {
            if (data.length === 0) {
                alert('Giỏ hàng của bạn hiện đang trống.');
                return;
            }
            let tongTien = data.reduce((tong, item) => tong + (item.gia_ban * item.so_luong_san_pham), 0);
            if (confirm(`Bạn có chắc chắn muốn thanh toán với tổng số tiền là ${tongTien.toLocaleString('vi-VN')} VND?`)) {
                fetch('user-data/thanh-toan', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ tong_tien: tongTien })
                })
                    .then(res => res.json())
                    .then(data => {
                        alert(data.message)
                        loadGioHang();
                    })

            }
        })
        .catch(error => {
            console.error(error);
        });
}



// Load dữ liệu tùy theo trang
document.addEventListener('DOMContentLoaded', () => {
    switch (window.location.pathname) {
        case '/bo-suu-tap':
            LoadSanPham()
            break;
        case '/trang-ca-nhan':
            LoadTrangCaNhan()
            break;
        case '/gio-hang':
            loadGioHang()
            break;
        default:
            break;
    }
});


