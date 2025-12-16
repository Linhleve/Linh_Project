function closeForm() {
    dataForm.style.display = "none";
    dataFormContent.innerHTML = '';
}

function mysqlToDatetimeLocal(mysqlDate) {
    const date = new Date(mysqlDate);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date - tzOffset).toISOString().slice(0,16);
}

class QuanLyBang{
    constructor (tableName, objectName, PK1name, PK2name) {
        this._tableName = tableName;
        this._PK1name = PK1name;
        this._PK2name = PK2name;
        this.objectName = objectName;
        this.tableLocation = document.getElementById('manageTable')
    }

    Them() {
        dataForm.style.display = "block";

        if (!document.getElementById('xacNhanBtn')) {
            dataFormContent.innerHTML += `<br><button id="xacNhanBtn" class="button" type="submit">Xác nhận</button>`;
        }

        const newFormContent = dataFormContent.cloneNode(true);
        dataFormContent.parentNode.replaceChild(newFormContent, dataFormContent);


        newFormContent.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(newFormContent);
            const data = Object.fromEntries(formData.entries());

            fetch(`/manage-data/${this._tableName}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        alert(result.message || 'Thêm thành công!');
                        this.LayDuLieu();
                        closeForm();
                    } else {
                        alert(result.message || 'Thêm thất bại.');
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert('Thêm thất bại. Hãy kiểm tra lại dữ liệu.');
                });
        });
        window.dataFormContent = newFormContent;
    }

    Sua(PK1, PK2) {
        let fetchUrl = ''
        if (PK2) {
            fetchUrl = `/manage-data/${this._tableName}/${this._PK1name}/${PK1}/${this._PK2name}/${PK2}`;
        } else {
            fetchUrl = `/manage-data/${this._tableName}/${this._PK1name}/${PK1}`;
        }


        fetch(fetchUrl)
            .then(res => res.json())
            .then(data => {

                for (const key in data) {
                    const input = dataFormContent.querySelector(`[name="${key}"]`);
                    if (input) {
                        if (input.type === 'datetime-local') {
                            input.value = mysqlToDatetimeLocal(data[key]);
                        } else {input.value = data[key]}
                    }
                }
            })
            .catch(err => console.error('Lỗi fetch dữ liệu cũ:', err));


        dataForm.style.display = "block";


        if (!document.getElementById('xacNhanBtn')) {
            dataFormContent.innerHTML += `<br><button id="xacNhanBtn" class="button" type="submit">Xác nhận</button>`;
        }


        const newFormContent = dataFormContent.cloneNode(true);
        dataFormContent.parentNode.replaceChild(newFormContent, dataFormContent);


        newFormContent.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(newFormContent);
            const data = Object.fromEntries(formData.entries());

            fetch(fetchUrl, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        alert(result.message || 'Sửa thành công!');
                        this.LayDuLieu();
                        closeForm();
                    } else {
                        alert(result.message || 'Sửa thất bại.');
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert('Sửa thất bại. Hãy kiểm tra lại dữ liệu.');
                });
        });
        window.dataFormContent = newFormContent;
    }

    Xoa(PK1, PK2) {
        if (confirm(`Bạn có chắc muốn xóa không?` )) {
            if (!PK2) {
                fetch(`/manage-data/${this._tableName}/${this._PK1name}/${PK1}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                    .then(res => res.json())
                    .then(data => {
                        alert(data.message);
                        this.LayDuLieu()
                    })
                    .catch(error => {
                        alert('Xóa thất bại. Hãy kiểm tra lại khóa ngoại.');
                        console.error(error);
                    })
            } else {
                fetch(`/manage-data/${this._tableName}/${this._PK1name}/${PK1}/${this._PK2name}/${PK2}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                    .then(res => res.json())
                    .then(data => {alert(data.message);
                        this.LayDuLieu()
                    })
                    .catch(error => {alert('Xóa thất bại. Hãy kiểm tra lại khóa ngoại.');
                        console.error(error);})
            }
        }

        }


    LayDuLieu() {
        fetch(`/manage-data/${this._tableName}`)
            .then(res => res.json())
            .then(data => {
                this.tableLocation .innerHTML = '';
                this.HienThiDuLieu(data);
            })
            .catch(error => {
                console.error(error);
            });
    }

    HienThiDuLieu(data) {
        data.forEach(item => {
            let rowData = ''
            Object.values(item).forEach(value => {
                rowData += `<td>${value}</td>`;
            })
            if (this._PK2name) {
                rowData += `<td><button onclick="${this.objectName}.Sua(${item[this._PK1name]}, ${item[this._PK2name]})">Sửa</button> <button onclick="${this.objectName}.Xoa(${item[this._PK1name]}, ${item[this._PK2name]})">Xóa</button></td>`
            } else {
                rowData += `<td><button onclick="${this.objectName}.Sua(${item[this._PK1name]})">Sửa</button> <button onclick="${this.objectName}.Xoa(${item[this._PK1name]})">Xóa</button></td>`
            }

            this.tableLocation .innerHTML += `<tr>${rowData}</tr>`
        })

    }
}


class SanPhamTable extends QuanLyBang {
    constructor() {
        super('san_pham','sanPham', 'id_san_pham');
    }

    Them() {
        dataFormContent.innerHTML = `
            <div class="full-width container">
                <label for="ten_san_pham" class="width20">Tên sản phẩm:</label>
                <input type="text" id="ten_san_pham" name="ten_san_pham" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="thuong_hieu" class="width20">Thương hiệu:</label>
                <input type="text" id="thuong_hieu" name="thuong_hieu" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="gia_ban" class="width20">Giá:</label>
                <input type="number" id="gia_ban" name="gia_ban" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="mo_ta" class="width20">Mô tả:</label>
                <input type="text" id="mo_ta" name="mo_ta" class="form-2 width60" required>
            </div>  
            <div class="full-width container">
                <label for="dung_tich" class="width20">Dung tích:</label>
                <input type="text" id="dung_tich" name="dung_tich" class="form-2 width60" required>
            </div>
            <div  class="full-width container">  
                <label for="xuat_su" class="width20">Xuất xứ:</label>
                <input type="text" id="xuat_su" name="xuat_su" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="phan_loai" class="width20">Phân loại:</label>
                <select id="phan_loai" name="phan_loai" class="form-2 width60" required>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Unisex">Unisex</option>
                </select>
            </div>
        `
        super.Them();
    }

    Sua(id_san_pham) {
        dataFormContent.innerHTML = `
            <div class="full-width container">
                <label for="id_san_pham" class="width20">ID Sản phẩm:</label>
                <input type="number" id="id_san_pham" name="id_san_pham" class="form-2 width60" value="${id_san_pham}" readonly>
            </div>
            <div class="full-width container">
                <label for="ten_san_pham" class="width20">Tên sản phẩm:</label>
                <input type="text" id="ten_san_pham" name="ten_san_pham" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="thuong_hieu" class="width20">Thương hiệu:</label>
                <input type="text" id="thuong_hieu" name="thuong_hieu" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="gia_ban" class="width20">Giá:</label>
                <input type="number" id="gia_ban" name="gia_ban" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="mo_ta" class="width20">Mô tả:</label>
                <input type="text" id="mo_ta" name="mo_ta" class="form-2 width60" required>
            </div>  
            <div class="full-width container">
                <label for="dung_tich" class="width20">Dung tích:</label>
                <input type="text" id="dung_tich" name="dung_tich" class="form-2 width60" required>
            </div>
            <div  class="full-width container">  
                <label for="xuat_su" class="width20">Xuất xứ:</label>
                <input type="text" id="xuat_su" name="xuat_su" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="phan_loai" class="width20">Phân loại:</label>
                <select id="phan_loai" name="phan_loai" class="form-2 width60" required>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Unisex">Unisex</option>
                </select>
            </div>
            <div class="full-width container">
                <label for="ton_kho" class="width20">Tồn kho:</label>
                <input type="number" id="ton_kho" name="ton_kho" class="form-2 width60" required>
            </div>
        `
        super.Sua(id_san_pham)
    }

    Xoa(id_san_pham) {
        super.Xoa(id_san_pham);

    }

    LayDuLieu() {
        super.LayDuLieu()
        addBUtton.onclick = () => {sanPham.Them()}
    }

    HienThiDuLieu(data) {
        this.tableLocation.innerHTML = `
            <tr>
            <td>ID</td>
            <td>Tên</td>
            <td>Thương hiệu</td>
            <td>Giá</td>
            <td>Mô tả</td>
            <td>Dung tích</td>
            <td>Xuất sứ</td>
            <td>Phân Loại</td>
            <td>Tồn kho</td>
            <td>Hành dộng</td>
            </tr>
        `;
        super.HienThiDuLieu(data);
    }
}

class TaiKHoanTable extends QuanLyBang {
    constructor() {
        super('tai_khoan','taiKhoan', 'id_tai_khoan');
    }

    Them() {
        dataFormContent.innerHTML = `
        <div class="full-width container">
            <label for="ten_tai_khoan" class="width20">Tên đăng nhập:</label>
            <input type="text" id="ten_tai_khoan" name="ten_tai_khoan" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="mat_khau" class="width20">Mật khẩu:</label>
            <input type="text" id="mat_khau" name="mat_khau" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="ten_nguoi_dung" class="width20">Họ và tên:</label>
            <input type="text" id="ten_nguoi_dung" name="ten_nguoi_dung" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="vai_tro" class="width20">Vai trò:</label>
            <select id="vai_tro" name="vai_tro" class="form-2 width60" required>
                <option value="Khách hàng">Khách hàng</option>
                <option value="Nhân viên">Nhân viên</option>
                <option value="Quản lý">Quản lý</option>
            </select>
        </div>
        <div class="full-width container">
            <label for="so_du" class="width20">Số dư:</label>
            <input type="number" id="so_du" name="so_du" class="form-2 width60" value="0" required>
        </div>
        <div class="full-width container">
            <label for="so_dien_thoai" class="width20">Số điện thoại:</label>
            <input type="number" id="so_dien_thoai" name="so_dien_thoai" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="email" class="width20">Email:</label>
            <input type="email" id="email" name="email" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="dia_chi" class="width20">Địa chỉ:</label>
            <input type="text" id="dia_chi" name="dia_chi" class="form-2 width60" required>
        </div>

        `
        super.Them();
    }

    Sua(id_tai_khoan) {
        dataFormContent.innerHTML = `
        <div class="full-width container">
            <label for="id_tai_khoan" class="width20">ID Tài khoản:</label>
            <input type="number" id="id_tai_khoan" name="id_tai_khoan" class="form-2 width60" value="${id_tai_khoan}" readonly>
        </div>
        <div class="full-width container">
            <label for="ten_tai_khoan" class="width20">Tên đăng nhập:</label>
            <input type="text" id="ten_tai_khoan" name="ten_tai_khoan" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="mat_khau" class="width20">Mật khẩu:</label>
            <input type="text" id="mat_khau" name="mat_khau" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="ten_nguoi_dung" class="width20">Họ và tên:</label>
            <input type="text" id="ten_nguoi_dung" name="ten_nguoi_dung" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="vai_tro" class="width20">Vai trò:</label>
            <select id="vai_tro" name="vai_tro" class="form-2 width60" required>
                <option value="Khách hàng">Khách hàng</option>
                <option value="Nhân viên">Nhân viên</option>
                <option value="Quản lý">Quản lý</option>
            </select>
        </div>
        <div class="full-width container">
            <label for="so_du" class="width20">Số dư:</label>
            <input type="number" id="so_du" name="so_du" class="form-2 width60" value="0" required>
        </div>
        <div class="full-width container">
            <label for="so_dien_thoai" class="width20">Số điện thoại:</label>
            <input type="number" id="so_dien_thoai" name="so_dien_thoai" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="email" class="width20">Email:</label>
            <input type="email" id="email" name="email" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="dia_chi" class="width20">Địa chỉ:</label>
            <input type="text" id="dia_chi" name="dia_chi" class="form-2 width60" required>
        </div>

        `
        super.Sua(id_tai_khoan)
    }

    Xoa(id_tai_khoan) {
        super.Xoa(id_tai_khoan);
    }

    LayDuLieu() {
        super.LayDuLieu();
        addBUtton.onclick = () => {taiKhoan.Them()}
    }

    HienThiDuLieu(data) {
        this.tableLocation.innerHTML = `
            <tr>
            <td>ID</td>
            <td>Tên đăng nhập</td>
            <td>Mật khẩu</td>
            <td>Họ và tên</td>
            <td>Vai trò</td>
            <td>Số dư</td>
            <td>Số điện thoại</td>
            <td>Email</td>
            <td>Địa chỉ</td>
            <td>Hành động</td>
            </tr>
        `;
        super.HienThiDuLieu(data);
    }
}


class NhapHanngTable extends QuanLyBang {
    constructor() {
        super('nhap_hang','nhapHang', 'id_nhap_hang', );
    }

    Them() {
        dataFormContent.innerHTML = `
        <div class="full-width container">
            <label for="id_san_pham" class="width20">ID Sản phẩm:</label>
            <input type="number" id="id_san_pham" name="id_san_pham" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="so_luong" class="width20">Số lượng:</label>
            <input type="number" id="so_luong" name="so_luong" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="thoi_gian" class="width20">Thời gian nhập:</label>
            <input type="datetime-local" id="thoi_gian" name="thoi_gian" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="gia_nhap" class="width20">Giá nhập:</label>
            <input type="number" id="gia_nhap" name="gia_nhap" class="form-2 width60" required>
        </div>
        `
        super.Them();
    }

    Sua(id_nhap_hang) {
        dataFormContent.innerHTML = `
            <div class="full-width container">
                <label for="id_nhap_hang" class="width20">ID Nhập hàng:</label>
                <input type="number" id="id_nhap_hang" name="id_nhap_hang" class="form-2 width60" value="${id_nhap_hang}" readonly>
            </div>
            <div class="full-width container">
                <label for="id_san_pham" class="width20">ID Sản phẩm:</label>
                <input type="number" id="id_san_pham" name="id_san_pham" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="so_luong" class="width20">Số lượng:</label>
                <input type="number" id="so_luong" name="so_luong" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="thoi_gian" class="width20">Giá nhập:</label>
                <input type="datetime-local" id="thoi_gian" name="thoi_gian" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="gia_nhap" class="width20">Giá nhập:</label>
                <input type="number" id="gia_nhap" name="gia_nhap" class="form-2 width60" required>
            </div>
        `
        super.Sua(id_nhap_hang);
    }

    Xoa(id_nhap_hang, id_san_pham) {
        super.Xoa(id_nhap_hang);
    }

    LayDuLieu() {
        super.LayDuLieu();
        addBUtton.onclick = () => {nhapHang.Them()}
    }

    HienThiDuLieu(data) {
        this.tableLocation.innerHTML = `
            <tr>
            <td>ID Nhập</td>
            <td>ID Sản phẩm</td>
            <td>Số lượng</td>
            <td>Ngày nhập</td>
            <td>Giá nhập</td>
            <td>Hành động</td>
            </tr>
        `;
        super.HienThiDuLieu(data);
    }
}


class HoaDonTable extends QuanLyBang {
    constructor() {
        super('hoa_don','hoaDon', 'id_hoa_don');
    }

    Them() {
        dataFormContent.innerHTML = `
            <div class="full-width container">
                <label for="id_khach_hang" class="width20">ID Khách hàng:</label>
                <input type="number" id="id_khach_hang" name="id_khach_hang" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="thoi_gian" class="width20">Ngày lập:</label>
                <input type="datetime-local" id="thoi_gian" name="thoi_gian" class="form-2 width60" required>
            </div>
        `
        super.Them();
    }

    Sua(id_hoa_don) {
        dataFormContent.innerHTML = `
            <div class="full-width container">
                <label for="id_hoa_don" class="width20">ID Hóa đơn:</label>
                <input type="number" id="id_hoa_don" name="id_hoa_don" class="form-2 width60" value="${id_hoa_don}" readonly>
            </div>
            <div class="full-width container">
                <label for="id_khach_hang" class="width20">ID Khách hàng:</label>
                <input type="number" id="id_khach_hang" name="id_khach_hang" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="thoi_gian" class="width20">Ngày lập:</label>
                <input type="datetime-local" id="thoi_gian" name="thoi_gian" class="form-2 width60" required>
            </div>
            <div class="full-width container">
                <label for="tong_tien" class="width20">Tổng tiền:</label>
                <input type="number" id="tong_tien" name="tong_tien" class="form-2 width60" required>
            </div>>
        `
        super.Sua(id_hoa_don);
    }

    Xoa(id_hoa_don) {
        super.Xoa(id_hoa_don);
    }

    LayDuLieu() {
        super.LayDuLieu();
        addBUtton.onclick = () => {hoaDon.Them()}
    }

    HienThiDuLieu(data) {
        this.tableLocation.innerHTML = `
            <tr>
            <td>ID Hóa đơn</td>
            <td>ID Khách hàng</td>
            <td>Ngày lập</td>
            <td>Tổng tiền</td>
            <td>Hành động</td>
            </tr>
        `;
        super.HienThiDuLieu(data);
    }
}

class NapTienTable extends QuanLyBang {
    constructor() {
        super('nap_tien','napTien', 'id_giao_dich');
    }

    Them() {
        dataFormContent.innerHTML = `
        <div class="full-width container">
            <label for="id_tai_khoan" class="width20">ID Tài khoản:</label>
            <input type="number" id="id_tai_khoan" name="id_tai_khoan" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="so_tien" class="width20">Số tiền:</label>
            <input type="number" id="so_tien" name="so_tien" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="thoi_gian" class="width20">Ngày nạp:</label>
            <input type="datetime-local" id="thoi_gian" name="thoi_gian" class="form-2 width60" required>
        </div>
        `
        super.Them()
    }

    Sua(id_giao_dich) {
        dataFormContent.innerHTML = `
        <div class="full-width container">
            <label for="id_giao_dich" class="width20">ID Giao dịch:</label>
            <input type="number" id="id_giao_dich" name="id_giao_dich" class="form-2 width60" value="${id_giao_dich}" readonly>
        </div>
        <div class="full-width container">
            <label for="id_tai_khoan" class="width20">ID Tài khoản:</label>
            <input type="number" id="id_tai_khoan" name="id_tai_khoan" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="so_tien" class="width20">Số tiền:</label>
            <input type="number" id="so_tien" name="so_tien" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="thoi_gian" class="width20">Ngày nạp:</label>
            <input type="datetime-local" id="thoi_gian" name="thoi_gian" class="form-2 width60" required>
        </div>
        `
        super.Sua(id_giao_dich);
    }

    Xoa(id_giao_dich) {
        super.Xoa(id_giao_dich);
    }

    LayDuLieu() {
        super.LayDuLieu();
        addBUtton.onclick = () => {napTien.Them()}
    }

    HienThiDuLieu(data) {
        this.tableLocation.innerHTML = `
            <tr>
            <td>ID Giao dịch</td>
            <td>ID Tài khoản</td>
            <td>Số tiền</td>
            <td>Ngày nạp</td>
            <td>Hành động</td>
            </tr>
        `;
        super.HienThiDuLieu(data);
    }
}

class GioHangTable extends QuanLyBang {
    constructor() {
        super('gio_hang','gioHang', 'id_tai_khoan', 'id_san_pham');
    }

    Them() {
        dataFormContent.innerHTML = `
        <div class="full-width container">
            <label for="id_tai_khoan" class="width20">ID Tài khoản:</label>
            <input type="number" id="id_tai_khoan" name="id_tai_khoan" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="id_san_pham" class="width20">ID Sản phẩm:</label>
            <input type="number" id="id_san_pham" name="id_san_pham" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="so_luong_san_pham" class="width20">Số lượng:</label>
            <input type="number" id="so_luong_san_pham" name="so_luong_san_pham" class="form-2 width60" required>
        </div>
        `
        super.Them();
    }

    Sua(id_tai_khoan, id_san_pham) {
        dataFormContent.innerHTML = `
        <div class="full-width container">
            <label for="id_tai_khoan" class="width20">ID Tài khoản:</label>
            <input type="number" id="id_tai_khoan" name="id_tai_khoan" class="form-2 width60" value="${id_tai_khoan}" readonly>
        </div>
        <div class="full-width container">
            <label for="id_san_pham" class="width20">ID Sản phẩm:</label>
            <input type="number" id="id_san_pham" name="id_san_pham" class="form-2 width60" value="${id_san_pham}" readonly>
        </div>
        <div class="full-width container">
            <label for="so_luong_san_pham" class="width20">Số lượng:</label>
            <input type="number" id="so_luong_san_pham" name="so_luong_san_pham" class="form-2 width60" required>
        </div>
        `
        super.Sua(id_tai_khoan, id_san_pham);
    }

    Xoa(id_tai_khoan, id_san_pham) {
        super.Xoa(id_tai_khoan, id_san_pham);
    }

    LayDuLieu() {
        super.LayDuLieu();
        addBUtton.onclick = () => {gioHang.Them()}
    }

    HienThiDuLieu(data) {
        this.tableLocation.innerHTML = `
            <tr>
            <td>ID Tài khoản</td>
            <td>ID Sản phẩm</td>
            <td>Số lượng</td>
            <td>Hành động</td>
            </tr>
        `;
        super.HienThiDuLieu(data);
    }
}

class HoaDonChiTietTable extends QuanLyBang {
    constructor() {
        super('hoa_don_chi_tiet','hoaDonChiTiet', 'id_hoa_don', 'id_san_pham');
    }

    Them() {
        dataFormContent.innerHTML = `
        <div class="full-width container">
            <label for="id_hoa_don" class="width20">ID Hóa đơn:</label>
            <input type="number" id="id_hoa_don" name="id_hoa_don" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="id_san_pham" class="width20">ID Sản phẩm:</label>
            <input type="number" id="id_san_pham" name="id_san_pham" class="form-2 width60" required>
        </div>
        <div class="full-width container">
            <label for="so_luong" class="width20">Số lượng:</label>
            <input type="number" id="so_luong" name="so_luong" class="form-2 width60" required>
        </div>
        `
        super.Them();
    }

    Sua(id_hoa_don, id_san_pham) {
        dataFormContent.innerHTML = `
        <div class="full-width container">
            <label for="id_hoa_don" class="width20">ID Hóa đơn:</label>
            <input type="number" id="id_hoa_don" name="id_hoa_don" class="form-2 width60" value="${id_hoa_don}" readonly>
        </div>
        <div class="full-width container">
            <label for="id_san_pham" class="width20">ID Sản phẩm:</label>
            <input type="number" id="id_san_pham" name="id_san_pham" class="form-2 width60" value="${id_san_pham}" readonly>
        </div>
        <div class="full-width container">
            <label for="so_luong" class="width20">Số lượng:</label>
            <input type="number" id="so_luong" name="so_luong" class="form-2 width60" required>
        </div>
        `
        super.Sua(id_hoa_don, id_san_pham);
    }

    Xoa(id_hoa_don, id_san_pham) {
        super.Xoa(id_hoa_don, id_san_pham);
    }

    LayDuLieu() {
        super.LayDuLieu();
        addBUtton.onclick = () => {hoaDonChiTiet.Them()}
    }

    HienThiDuLieu(data) {
        this.tableLocation.innerHTML = `
            <tr>
            <td>ID Hóa đơn</td>
            <td>ID Sản phẩm</td>
            <td>Số lượng</td>
            <td>Hành động</td>
            </tr>
        `;
        super.HienThiDuLieu(data);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.sanPham = new SanPhamTable();
    window.taiKhoan = new TaiKHoanTable();
    window.nhapHang = new NhapHanngTable();
    window.hoaDon = new HoaDonTable();
    window.napTien = new NapTienTable();
    window.gioHang = new GioHangTable();
    window.hoaDonChiTiet = new HoaDonChiTietTable();

    window.dataForm = document.getElementById("dataForm");
    window.dataFormContent = document.getElementById("dataFormContent");
    window.addBUtton = document.getElementById("addRow");
});