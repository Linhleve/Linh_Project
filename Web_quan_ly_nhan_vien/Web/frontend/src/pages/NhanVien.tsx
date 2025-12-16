import {useEffect, useState} from "react";
import '../css/NhanVien.css';
import axios from "axios";


interface NhanVien {
  ma_nhan_vien: string;
  ho_ten: string;
  ma_phong: string;
  ma_chuc_vu: string;
  muc_luong_co_ban: string;
  trang_thai?: string;
} 

interface ChucVu {
  ma_chuc_vu: string;
  ten_chuc_vu: string;
}

interface PhongBan {
  ma_phong: string;
  ten_phong: string;
}

const ListNhanVien = () => {
  const [nhamVien, setNhanVien] = useState<NhanVien[]>([]);
  const [showForm, setshowForm] = useState(false);
  const [hoTen, sethoTen] = useState("");
  const [maPhong, setmaPhong] = useState("");
  const [maChucVu, setmaChucVu] = useState("");
  const [mucLuongCoBan, setmucLuongCoBan] = useState("");
  const [formUpdate, setformUpdate] = useState(false);
  const [maNVCu, setmaNVCu] = useState("");
  const [hoTenMoi, sethoTenMoi] = useState("");
  const [mucLuongCoBanMoi, setmucLuongCoBanMoi] = useState("");
  const [searchBox, setSearchBox] = useState("");

  const [showHidden, setShowHidden] = useState(false);
  const [phongBan, setPhongBan] = useState<PhongBan[]>([]);
  const [chucVu, setChucVu] = useState<ChucVu[]>([]);

  const [showTTNV, setShowTTNV] = useState(false);
  const [showTKDN, setShowTKDN] = useState(false);

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  useEffect(() => {
    fetchData();
  }, [showHidden]);

  const fetchData = () => {
    console.log(showHidden);  
    const url = showHidden 
      ? "http://localhost:5000/api/nhanvien?hidden=true"
      : "http://localhost:5000/api/nhanvien";
    axios
      .get<NhanVien[]>(url)
      .then((res) => setNhanVien(res.data))
      .catch((err) => console.error("Lỗi khi lấy dữ liệu:", err));

    axios
      .get<PhongBan[]>("http://localhost:5000/api/phongban")
      .then((res) => setPhongBan(res.data))
      .catch((err) => console.error("Lỗi khi lấy dữ liệu:", err));
      
    axios
      .get<ChucVu[]>("http://localhost:5000/api/chucvu")
      .then((res) => setChucVu(res.data))
      .catch((err) => console.error("Lỗi khi lấy dữ liệu:", err));  
  } 

  const handleHideAllNhanVien = async() => {
    if (!window.confirm("Bạn chắc chắn muốn ẩn tất cả nhân viên đang hoạt động?")) {
      return;
    }
    try {
      await axios.put("http://localhost:5000/api/nhanvien/hide-all");
      fetchData();
      alert("Đã ẩn tất cả nhân viên đang hoạt động.");
    } catch (error) {
      alert("Ẩn tất cả nhân viên thất bại.");
    }
  }

  const handleRestoreAllNhanVien = async() => {
    if (!window.confirm("Bạn chắc chắn muốn bỏ ẩn tất cả nhân viên?")) {
      return;
    }
    try {
      await axios.put("http://localhost:5000/api/nhanvien/restore-all");
      fetchData();
      alert("Đã bỏ ẩn tất cả nhân viên.");
    } catch (error) {
      alert("Bỏ ẩn tất cả nhân viên thất bại.");
    }
  }

  const handleAddNhanVien = async() => {
    console.log({ hoTen, maPhong, maChucVu, mucLuongCoBan });
    if (!hoTen || !maPhong || !maChucVu || !mucLuongCoBan || !user || !pass) {
      alert("Bạn chưa điền đủ thông tin.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/api/nhanvien",
        {
          ho_ten: hoTen,
          ma_phong: maPhong,
          ma_chuc_vu: maChucVu,
          muc_luong_co_ban: mucLuongCoBan,
          username: user,
          password: pass
        });
      fetchData();
      sethoTen("");
      setmaPhong("");
      setmaChucVu("");
      setmucLuongCoBan("");
      setUser("");
      setPass("");
      setshowForm(false);
    } catch (error) {
      alert("Thêm nhân viên thất bại.")
    }
  };

  const handleDeleteNhanVien = async(ma_nhan_vien: string) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa nhân viên này?")) {
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/nhanvien/${ma_nhan_vien}`);
      fetchData();
      alert("Xóa nhân viên thành công!");
    } catch (error) {
      alert("Xóa nhân viên thất bại.");
    }
  }

  const handleHideNhanVien = async(ma_nhan_vien: string) => {
    if (!window.confirm("Bạn chắc chắn muốn ẩn nhân viên này?")) {
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/nhanvien/${ma_nhan_vien}/hide`);
      fetchData();
      alert("Ẩn nhân viên thành công!");
    } catch (error) {
      alert("Ẩn nhân viên thất bại.");
    }
  }

  const handleRestoreNhanVien = async(ma_nhan_vien: string) => {
    if (!window.confirm("Bạn chắc chắn muốn khôi phục nhân viên này?")) {
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/nhanvien/${ma_nhan_vien}/restore`);
      fetchData();
      alert("Khôi phục nhân viên thành công!");
    } catch (error) {
      alert("Khôi phục nhân viên thất bại.");
    }
  }

  const handleUpdateNhanVien = async(ma_nhan_vien: string) => {
    if (!hoTenMoi || !mucLuongCoBanMoi) {
      alert("Bạn chưa điền đủ thông tin.");
      return;
    }try {
      await axios.put(`http://localhost:5000/api/nhanvien/${ma_nhan_vien}`, {
        ho_ten_moi: hoTenMoi,
        muc_luong_co_ban_moi: mucLuongCoBanMoi
      });
      fetchData();
      sethoTenMoi("");
      setmucLuongCoBanMoi("");
      setformUpdate(false);
      alert("Bạn chắc chắn muốn cập nhật nhân viên này?");
    } catch (error) {
      alert("Cập nhật nhân viên thất bại.");
    }
  }

  const handleSearch = nhamVien.filter((nv) => {
    return  nv.ho_ten.toLowerCase().includes(searchBox.toLowerCase()) || 
            nv.ma_nhan_vien.toLowerCase().includes(searchBox.toLowerCase()) ||
            nv.ma_phong.toLowerCase().includes(searchBox.toLowerCase()) ||
            nv.ma_chuc_vu.toLowerCase().includes(searchBox.toLowerCase()) ||
            nv.muc_luong_co_ban.toString().toLowerCase().includes(searchBox.toLowerCase());
  });

  const openUpdateForm = (nv: NhanVien) => {
    setmaNVCu(nv.ma_nhan_vien);
    sethoTenMoi(nv.ho_ten);
    setmucLuongCoBanMoi(nv.muc_luong_co_ban);
    setformUpdate(true);
  };

  return (
    <div className="content_container_nv">
      <div className="container_nv">
        <div className="content_title">
          <div className="content_title_1">
            <h4>Quản lý Nhân viên</h4>
            <p>Quản lý thông tin chi tiết nhân viên và mức lương </p>
          </div>
          <div className="searchbox_nv">
            <input type="text"
                    placeholder="Tìm mã, tên, phòng ..."
                    value={searchBox}
                    onChange={(e) => setSearchBox(e.target.value)}
            />
            <button 
              className="button_view_hidden" 
              onClick={() => setShowHidden(!showHidden)}
            >
              {showHidden ? "Xem nhân viên đang hoạt động" : "Xem nhân viên đã ẩn"}
            </button>
          </div>
          <div className="showtable">
            <button onClick={showHidden ? handleRestoreAllNhanVien : handleHideAllNhanVien}>
              {showHidden ? "Bỏ ẩn tất cả" : "Ẩn nhân viên"}
            </button>
          </div>
          <div className="content_title_nv">
            <button onClick={() => setshowForm(true)}>+ Thêm nhân viên</button>
          </div>
        </div>

        <div className="content_main">
          <div className="content_main_table">
            <table>
              <thead>
                <tr>
                  <th>Mã NV</th>
                  <th>Tên nhân viên</th>
                  <th>Phòng ban</th>
                  <th>Chức vụ</th>
                  <th>Lương cơ bản</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {handleSearch.map((item) => (
                  <tr key={item.ma_nhan_vien}>
                    <td>{item.ma_nhan_vien}</td>
                    <td>{item.ho_ten}</td>
                    <td>{item.ma_phong}</td>
                    <td>{item.ma_chuc_vu}</td>
                    <td>{item.muc_luong_co_ban} đ</td>
                    <td>{item.trang_thai || "Hoạt động"}</td>
                    <td>
                      <div className="buttons_group">
                        {showHidden ? (
                          <>
                            <button className="button_restore" onClick={() => handleRestoreNhanVien(item.ma_nhan_vien)}> 🔄 </button>
                            <button className="button_delete" onClick={() => handleDeleteNhanVien(item.ma_nhan_vien)}> 🗑️ </button>
                          </>
                        ) : (
                          <>
                            <button className="button_edit" onClick={() => openUpdateForm(item)}> 🖋️ </button>
                            <button className="button_hide" onClick={() => handleHideNhanVien(item.ma_nhan_vien)}> 👁️ </button>
                            <button className="button_delete" onClick={() => handleDeleteNhanVien(item.ma_nhan_vien)}> 🗑️ </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>        


        {showForm && (
          <div className="form_overlay" onClick={() => setshowForm(false)}>
            <div className="form_container" onClick={(e) => e.stopPropagation()}>
              <div>
                <h4>Thêm nhân viên mới</h4>
                <p>Nhập thông tin nhân viên mới</p>
              </div>
              <div className="form_input_type">
                <button onClick={() => { setShowTTNV(true); setShowTKDN(false); }}>
                  Thông Tin Nhân Viên
                </button>

                <button onClick={() => { setShowTKDN(true); setShowTTNV(false); }}>
                  Tài Khoản Đăng Nhập
                </button>
              </div>

              {showTTNV && (
              <div className="form_inputs_ttnv">
                <div className="form_input">
                  <label>Tên nhân viên</label>
                  <input
                    type="text"
                    value={hoTen}
                    onChange={(e) => sethoTen(e.target.value)}
                  />
                </div>
                <div className="form_input">
                  <label>Phòng ban</label>
                  <select 
                    value={maPhong}
                    onChange={(e) => setmaPhong(e.target.value)}
                    >
                      <option value="">--- Chọn ---</option>
                      {phongBan.map((pb) => (
                        <option key={pb.ma_phong} value={pb.ma_phong}>
                          {pb.ten_phong} ({pb.ma_phong})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form_input">
                  <label>Chức vụ</label>
                  <select 
                    value={maChucVu}
                    onChange={(e) => setmaChucVu(e.target.value)}
                    >
                      <option value="">--- Chọn ---</option>
                      {chucVu.map((cv) => (
                        <option key={cv.ma_chuc_vu} value={cv.ma_chuc_vu}>
                          {cv.ten_chuc_vu} ({cv.ma_chuc_vu})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form_input">
                  <label>Lương cơ bản (VNĐ/tháng)</label>
                  <input 
                    type="number"
                    value={mucLuongCoBan} 
                    onChange={(e) => setmucLuongCoBan(e.target.value)} 
                    />
                </div>
              </div> 
              )}

              {showTKDN && (
              <div className="form_inputs_tkdn">
                <div className="form_input">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                  />
                </div>
                <div className="form_input">
                  <label>Mật khẩu</label>
                  <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                  />
                </div>
              </div>
              )} 
              <div className="form_buttons_type_nv">
                <div className="button_add">
                  <button 
                    onClick={() => {
                      handleAddNhanVien();
                      setShowTTNV(false); 
                      setShowTKDN(false);
                    }}
                  >
                    + Thêm nhân viên
                  </button>
                </div>
                <div className="button_cancel">
                  <button onClick={() => setshowForm(false)}> Hủy </button>
                </div>
              </div>  
            </div>
          </div>
        )}



        {formUpdate && (
          <div className="form_overlay" onClick={() => setformUpdate(false)}>
            <div className="form_container" onClick={(e) => e.stopPropagation()}>
              <div>
                <h4>Sửa nhân viên</h4>
                <p>Cập nhật thông tin nhân viên</p>
              </div>

              <div className="form_inputs_ttnv">
                <div className="form_input">
                  <label>Tên nhân viên</label>
                  <input
                    type="text"
                    value={hoTenMoi}
                    onChange={(e) => sethoTenMoi(e.target.value)}
                  />
                </div>
                <div className="form_input">
                  <label>Lương cơ bản (VNĐ/tháng)</label>
                  <input 
                    type="number"
                    value={mucLuongCoBanMoi} 
                    onChange={(e) => setmucLuongCoBanMoi(e.target.value)} 
                    />
                </div>
              </div>
              
              <div className="form_buttons_type_nv">
                <div className="button_add">
                  <button onClick={() =>handleUpdateNhanVien(maNVCu)}> Cập nhật </button>
                </div>
                <div className="button_cancel">
                  <button onClick={() => setformUpdate(false)}> Hủy </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

}
export default ListNhanVien;