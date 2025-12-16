import { useEffect, useState } from "react";
import "../css/BaoCaoLuong_nv.css";
import axios from "axios";

interface BaoCaoLuongNVProps {
  maNhanVien: string | null;
}

interface LuongThang {
  id: string;
  thang_nam: string;
  tong_gio_lam: string;
  gio_tang_ca: string;
  luong_co_ban: string;
  luong_tang_ca: string;
  luong_thuc_nhan: string;
}

interface BaoCaoNam {
  ma_nhan_vien: string;
  nam: number;
  tong_thu_nhap: string;
  tong_gio_lam: string;
  tong_gio_tang_ca: string;
  chi_tiet: LuongThang[];
}

interface NhanVienInfo {
  ma_nhan_vien: string;
  ho_ten: string;
  ma_phong: string;
  ma_chuc_vu: string;
}

export default function BaoCaoLuongNV({ maNhanVien }: BaoCaoLuongNVProps) {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [baoCaoNam, setBaoCaoNam] = useState<BaoCaoNam | null>(null);
  const [nhanVienInfo, setNhanVienInfo] = useState<NhanVienInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (maNhanVien) {
      fetchData();
    }
  }, [maNhanVien, currentYear]);

  const fetchData = async () => {
    if (!maNhanVien) return;
    setLoading(true);
    try {
      // Lấy thông tin nhân viên
      const nvRes = await axios.get(`http://localhost:5000/api/nhanvien`);
      const nv = nvRes.data.find((nv: NhanVienInfo) => nv.ma_nhan_vien === maNhanVien);
      if (nv) {
        setNhanVienInfo(nv);
      }

      // Lấy báo cáo lương theo năm
      const luongRes = await axios.get(`http://localhost:5000/api/luongnhanvien/my-salary/${maNhanVien}/${currentYear}`);
      setBaoCaoNam(luongRes.data);
    } catch (error) {
      console.error("Error fetching salary data", error);
      setBaoCaoNam(null);
    } finally {
      setLoading(false);
    }
  };

  if (!maNhanVien) {
    return <div>Không có thông tin nhân viên</div>;
  }

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  const formatCurrency = (value: string) => {
    return parseFloat(value || "0").toLocaleString('vi-VN') + " đ";
  };

  const formatMonth = (thangNam: string) => {
    const [year, month] = thangNam.split('-');
    const monthNames = [
      "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
      "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
    ];
    return `${monthNames[parseInt(month) - 1]} năm ${year}`;
  };

  return (
    <div className="salary-page">
      <div className="salary-header">
        <h1>Báo cáo lương</h1>
        <p className="subtitle">Thống kê thu nhập theo cá nhân và theo tháng</p>
        <div className="bao-cao-box">
          <div className="bao-cao-header">
            <div className="title-block">
              <h1>Báo cáo thu nhập cá nhân</h1>
              <h2>Thống kê và thu nhập cá nhân của nhân viên theo năm</h2>
            </div>
            <button className="export-btn">Xuất báo cáo</button>
          </div>

          <div className="filter-row">
            <div className="field">
              <label>Năm</label>
              <input
                type="number"
                value={currentYear}
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
                min="2020"
                max="2030"
              />
            </div>
          </div>

          {nhanVienInfo && (
            <div className="employee-info-card">
              <div className="info-block">
                <span className="label">Mã nhân viên</span>
                <span className="value">{nhanVienInfo.ma_nhan_vien}</span>
              </div>
              <div className="info-block">
                <span className="label">Tên nhân viên</span>
                <span className="value">{nhanVienInfo.ho_ten}</span>
              </div>
              <div className="info-block">
                <span className="label">Phòng ban</span>
                <span className="value">{nhanVienInfo.ma_phong}</span>
              </div>
              <div className="info-block">
                <span className="label">Chức vụ</span>
                <span className="value">{nhanVienInfo.ma_chuc_vu}</span>
              </div>
            </div>
          )}
        </div>

        {baoCaoNam && (
          <div className="bao-cao-box">
            <h2 className="bao-cao-header">Tổng kết năm {currentYear}</h2>
            <div className="summary-cards">
              <div className="sum-card green">
                <p className="title">Tổng thu nhập</p>
                <h3>{formatCurrency(baoCaoNam.tong_thu_nhap)}</h3>
              </div>
              <div className="sum-card blue">
                <p className="title">Tổng giờ làm việc</p>
                <h3>{parseFloat(baoCaoNam.tong_gio_lam || "0").toFixed(1)} giờ</h3>
              </div>
              <div className="sum-card yellow">
                <p className="title">Tổng giờ làm thêm</p>
                <h3>{parseFloat(baoCaoNam.tong_gio_tang_ca || "0").toFixed(1)} giờ</h3>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="monthly-detail">
        <div className="bao-cao-box">
          <div className="bao-cao-header">Chi tiết theo tháng</div>
          <div className="bao-cao-body">
            <table className="salary-table">
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
                {baoCaoNam && baoCaoNam.chi_tiet.length > 0 ? (
                  baoCaoNam.chi_tiet.map((item) => (
                    <tr key={item.id}>
                      <td>{formatMonth(item.thang_nam)}</td>
                      <td>{formatCurrency(item.luong_co_ban)}</td>
                      <td>{parseFloat(item.tong_gio_lam).toFixed(1)}h</td>
                      <td>{parseFloat(item.gio_tang_ca).toFixed(1)}h</td>
                      <td>{formatCurrency(item.luong_tang_ca)}</td>
                      <td>{formatCurrency(item.luong_thuc_nhan)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} style={{ textAlign: "center" }}>
                      Chưa có dữ liệu lương cho năm {currentYear}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
