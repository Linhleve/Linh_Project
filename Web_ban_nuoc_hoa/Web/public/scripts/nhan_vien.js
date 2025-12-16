let products = []

function themSanPham() {
    const select = document.getElementById("product-select");
    const pID = Number(select.value);
    const san_pham = products.find(boj => boj.id_san_pham === pID)
    if (san_pham) {
        san_pham.so_luong += 1;
    } else {
        products.push({
            id_san_pham: pID,
            ten_san_pham: select.options[select.selectedIndex].text,
            so_luong: 1
        });
    }
    hienThiSanPham()
}

function hienThiSanPham() {
    const sanPhamList = document.getElementById("products");
    sanPhamList.innerHTML = "";
    products.forEach(san_pham => {
        sanPhamList.innerHTML += `
            <div class="form-2 container width85">
                <p class="f28 width50">${san_pham.ten_san_pham}</p>
                <p class="f28">Số lượng: ${san_pham.so_luong}</p>
                <button class="f20 button" onclick="xoaSanPham(${san_pham.id_san_pham})">Xóa</button>
            </div>`
    })
}

function xoaSanPham(id_san_pham) {
    console.log(products)
    console.log(id_san_pham)
    products = products.filter(san_pham => san_pham.id_san_pham !== id_san_pham);
    hienThiSanPham();
}

function taoHoaDon() {
    if (products.length === 0) {
        alert("Không có sản phẩm nào để tạo hóa đơn.");
        return;
    }

    const hoaDon = products.map(san_pham => ({
        id_san_pham: san_pham.id_san_pham,
        so_luong: san_pham.so_luong
    }));

    fetch('tao-hoa-don', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(hoaDon)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            alert("Hóa đơn đã được tạo thành công!");
            products = [];
            hienThiSanPham();
        } else {
            alert("Lỗi khi tạo hóa đơn: " + data.message);
        }
    })
    .catch(error => console.error("Lỗi:", error));
}