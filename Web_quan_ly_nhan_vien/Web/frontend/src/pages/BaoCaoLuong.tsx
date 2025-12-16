import React, {useEffect, useState} from "react";
import '../css/BaoCaoLuong.css';
import axios from "axios";


interface BaoCaoLuong {
  id: string;
  ma_nhan_vien: string;
  thang_nam: string;
  tong_gio_lam: string;
  gio_tang_ca: string;
  luong_co_ban: string;
  luong_tang_ca: string;
  luong_thuc_nhan: string;
  ngay_tinh: string;
}

interface NhanVien {
  ma_nhan_vien: string;
  ho_ten: string;
  ma_phong: string;
  ma_chuc_vu: string;
  muc_luong_co_ban: string;
} 

interface LuongThang {
  id: string;
  ma_nhan_vien: string;
  thang_nam: string;
  tong_gio_lam: string;
  gio_tang_ca: string;
  luong_co_ban: string;
  luong_tang_ca: string;
  luong_thuc_nhan: string;
  ngay_tinh: string;
}


const ListBaoCaoLuong: React.FC = () => {
  const [BaoCaoLuong, setBaoCaoLuong] = useState<BaoCaoLuong[]>([]);
  const [nhanVien, setNhanVien] = useState<NhanVien[]>([]);
  const [luongThang, setLuongThang] = useState<LuongThang[]>([]);
  const [showBaoCaoCaNhan, setshowBaoCaoCaNhan] = useState(false);
  const [showBaoCaoThang, setshowBaoCaoThang] = useState(false);
  const [maNV, setmaNV] = useState("");
  const [thangNam, setThangNam] = useState(String(new Date().getFullYear()));

  const [thang, setThang] = useState("")
  

  useEffect(() => {
      fetchData();
    }, []);

  const fetchData = () => {
    axios
      .get<BaoCaoLuong[]>("http://localhost:5000/api/luongnhanvien")
      .then((res) => setBaoCaoLuong(res.data))
      .catch((err) => console.error("Lỗi khi lấy dữ liệu:", err));

    axios
      .get<NhanVien[]>("http://localhost:5000/api/nhanvien")
      .then((res) => setNhanVien(res.data))
      .catch((err) => console.error("Lỗi khi lấy dữ liệu:", err));

    axios
      .get<LuongThang[]>("http://localhost:5000/api/luongnhanvien")
      .then((res) => setLuongThang(res.data))
      .catch((err) => console.error("Lỗi khi lấy dữ liệu:", err));
     
  }   

  const handleBaoCaoCaNhan = () => {
    setshowBaoCaoCaNhan(true);
    setshowBaoCaoThang(false);
  };

  const handleBaoCaoThang = () => {
    setshowBaoCaoCaNhan(false);
    setshowBaoCaoThang(true);
  };

  
  const totalBaoCaoCN = BaoCaoLuong.filter(
    (bc) => bc.ma_nhan_vien === maNV && bc.thang_nam.startsWith(thangNam)
  );

  const tongGioLam = totalBaoCaoCN.reduce((sum, item) => sum + Number(item.tong_gio_lam), 0);
  const tongGioTangCa = totalBaoCaoCN.reduce((sum, item) => sum + Number(item.gio_tang_ca), 0);
  const tongLuongTangCa = totalBaoCaoCN.reduce((sum, item) => sum + Number(item.luong_tang_ca), 0);
  const tongLuongThucNhan = totalBaoCaoCN.reduce((sum, item) => sum + Number(item.luong_thuc_nhan), 0);


  const dataThang = luongThang.filter(item => item.thang_nam === thang);

  const tongGioThang = dataThang.reduce((s, i) => s + Number(i.tong_gio_lam), 0);
  const tongGioTangThang = dataThang.reduce((s, i) => s + Number(i.gio_tang_ca), 0);
  const tongLuongTangThang = dataThang.reduce((s, i) => s + Number(i.luong_tang_ca), 0);
  const tongLuongThucThang = dataThang.reduce((s, i) => s + Number(i.luong_thuc_nhan), 0);


  return (
    <div className="container">
      <div className="container_header">
        <div className="content_title_bc">
          <div className="content_title_bc1">
            <h4> Báo cáo lương </h4>
            <p> Thống kê thu nhập theo cá nhân và theo tháng </p>
          </div>
          <div className="content_title_button_bc">
            <button onClick={handleBaoCaoCaNhan}>Báo cáo cá nhân</button>
            <button onClick={handleBaoCaoThang}>Báo cáo theo tháng</button>
          </div>
        </div>

        <div className="content_main_bc">

          {showBaoCaoCaNhan && (
            <div className="title_main">
              <div className="title_main_1">
                <div className="title_info">
                  <h4>Báo Cáo Thu nhập Cá nhân</h4>
                  <p>Thống kê lương và thu nhập của nhân viên theo năm</p>
                </div>
                <div className="input_row">
                  <div className="input_from_bc">
                    <label>Chọn nhân viên</label>
                    <select 
                      value={maNV}
                      onChange={(e) => setmaNV(e.target.value)}
                      >
                        <option value="">Chọn nhân viên</option>
                        {nhanVien.map((nv) => (
                          <option key={nv.ma_nhan_vien} value={nv.ma_nhan_vien}>
                            {nv.ma_nhan_vien} - ({nv.ho_ten})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="input_from_bc">
                    <label>Năm</label>
                    <input 
                      type="number"
                      value={thangNam} 
                      onChange={(e) => setThangNam(e.target.value)} 
                      />
                  </div>
                </div>
              </div>

            {maNV && (
              <div className="title_main_content">
                <div className="title_main_content_2">
                  <div className="title_info">
                    <h4>Thông tin nhân viên</h4>
                  </div>
                  <div className="title_info_table_nv">
                    <table>
                      <thead>
                        <tr>
                          <th>Mã nhân viên</th>
                          <th>Tên nhân viên</th>
                          <th>Phòng ban</th>
                          <th>Chức vụ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nhanVien
                          .filter((nv) => String(nv.ma_nhan_vien) === String(maNV))
                          .map((item) => (
                            <tr key={item.ma_nhan_vien}>
                              <td>{item.ma_nhan_vien}</td>
                              <td>{item.ho_ten}</td>
                              <td>{item.ma_phong}</td>
                              <td>{item.ma_chuc_vu}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="title_main_content_3">
                  <div className="title_info">
                    <h4>Chi tiết theo tháng</h4>
                  </div>
                  <div className="title_info_table_bc">
                    <table>
                      <thead>
                        <tr>
                          <th>Tháng</th>
                          <th>Lương cơ bản</th>
                          <th>Giờ làm việc</th>
                          <th>Giờ làm thêm</th>
                          <th>Lương làm thêm</th>
                          <th>Tổng lương</th>
                        </tr>
                      </thead>
                      <tbody>
                        {BaoCaoLuong.filter(
                          (bc) =>
                            String(bc.ma_nhan_vien) === String(maNV) &&
                            bc.thang_nam.startsWith(thangNam)
                        ).map((item) => (
                          <tr key={item.id}>
                            <td>{item.thang_nam}</td>
                            <td>{item.luong_co_ban} ₫</td>
                            <td>{item.tong_gio_lam}h</td>
                            <td>{item.gio_tang_ca}h</td>
                            <td>{item.luong_tang_ca} ₫</td>
                            <td>{item.luong_thuc_nhan} ₫</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td><strong>Tổng cộng</strong></td>
                          <td>-</td>
                          <td><strong>{tongGioLam.toFixed(1)}h</strong></td>
                          <td><strong>{tongGioTangCa.toFixed(1)}h</strong></td>
                          <td><strong>{tongLuongTangCa.toLocaleString()} ₫</strong></td>
                          <td><strong>{tongLuongThucNhan.toLocaleString()} ₫</strong></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
            </div>
          )}

          {showBaoCaoThang && (
            <div className="title_main">
              <div className="title_main_1">
                <div className="title_info">
                  <h4>Báo cáo Lương Theo Tháng</h4>
                  <p>Tổng hợp lương của tất cả nhân viên trong tháng</p>
                </div>
                <div className="input_row">
                  <div className="input_from_bc">
                    <label>Chọn tháng</label>
                    <select 
                      value={thang}
                      onChange={(e) => setThang(e.target.value)}
                      >
                        <option value="">Chọn tháng</option>
                        {Array.from({ length: 12 }).map((_, i) => {
                          const m = String(i + 1).padStart(2, "0");
                          return (
                            <option key={m} value={`${thangNam}-${m}`}>
                              Tháng {m}/{thangNam}
                            </option>
                        )})}
                    </select>
                  </div>
                </div>
              </div>

            {thang && (
              <div className="title_main_content_3">
                <div className="title_info">
                  <h4>Chi tiết nhân viên</h4>
                </div>
                <div className="title_info_table_bc">
                  <table>
                    <thead>
                      <tr>
                        <th>Mã NV</th>
                        <th>Tên nhân viên</th>
                        <th>Phòng ban</th>
                        <th>Chức vụ</th>
                        <th>Giờ làm</th>
                        <th>Giờ thêm</th>
                        <th>Lương thêm</th>
                        <th>Tổng lương</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nhanVien.map((nv) => {
                        const lt = luongThang.find(
                          (item) => item.ma_nhan_vien === nv.ma_nhan_vien && 
                                    item.thang_nam === thang
                        );

                        return (
                          <tr key={nv.ma_nhan_vien}>
                            <td>{nv.ma_nhan_vien}</td>
                            <td>{nv.ho_ten}</td>
                            <td>{nv.ma_phong}</td>
                            <td>{nv.ma_chuc_vu}</td>
                            <td>{lt ? lt.tong_gio_lam : 0}h</td>
                            <td>{lt ? lt.gio_tang_ca : 0}h</td>
                            <td>{lt ? lt.luong_tang_ca : 0} ₫</td>
                            <td>{lt ? lt.luong_thuc_nhan : 0} ₫</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td><strong>Tổng cộng ({nhanVien.length} NV)</strong></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td><strong>{tongGioThang.toFixed(1)}h</strong></td>
                        <td><strong>{tongGioTangThang.toFixed(1)}h</strong></td>
                        <td><strong>{tongLuongTangThang.toLocaleString()} ₫</strong></td>
                        <td><strong>{tongLuongThucThang.toLocaleString()} ₫</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
            </div>
          )}

          {!showBaoCaoCaNhan && !showBaoCaoThang && (
            <p>Vui lòng chọn loại báo cáo để hiển thị.</p>
          )}
          
        </div>
      </div>  
    </div>
  )
}
export default ListBaoCaoLuong;