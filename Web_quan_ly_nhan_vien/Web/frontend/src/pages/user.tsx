import { useState, useEffect } from "react";
import ListChamCongNV from "./ChamCong_nv";
import ListTaiKhoanNV from "./ThongTin_nv";
import BaoCaoLuongNV from "./BaoCaoLuong_nv";
import "../css/User.css";
import axios from "axios";


export default function User({ username, maNhanVien, onLogout }: { username: string, maNhanVien: string | null, onLogout: () => void }) {
  const [renderPage, setRenderPage] = useState("trangchu");
  const [totalHours, setTotalHours] = useState(0);
  const [workDays, setWorkDays] = useState(0);

  const [userInfo, setUserInfo] = useState<any>({
    ho_ten: "",
    department: "",
    role: "Nhân viên",
    employeeId: "",
    luong_co_ban: "0"
  });
  const [todayAttendance, setTodayAttendance] = useState<any>(null);

  useEffect(() => {
    fetchUserData();
    fetchAttendanceStats();
    if (maNhanVien) {
      fetchTodayAttendance();
    }
  }, [maNhanVien]);

  const fetchUserData = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/taikhoan/${username}`);
      setUserInfo({
        ho_ten: res.data.name,
        department: res.data.department,
        role: userInfo.role,
        employeeId: res.data.employeeId,
        luong_co_ban: res.data.muc_luong_co_ban || "0"
      });
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  const fetchTodayAttendance = async () => {
    if (!maNhanVien) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chamcong/today/${maNhanVien}`);
      setTodayAttendance(res.data);
    } catch (error) {
      console.error("Error fetching today attendance", error);
      setTodayAttendance(null);
    }
  };

  const fetchAttendanceStats = async () => {
    if (!maNhanVien) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chamcong/stats/${maNhanVien}`);
      const data = res.data;
      setWorkDays(data.so_ngay_lam_viec || 0);
      setTotalHours(data.tong_gio_lam || 0);
    } catch (error) {
      console.error("Error fetching attendance stats", error);
    }
  };

  return (
    <div className="user-page">
      {/* Sidebar trái */}
      <aside className="user-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">Hệ Thống Nhân Viên</div>
          <div className="sidebar-subtitle">Thông tin cá nhân</div>
        </div>
        <div className="user-info-card">
          <div className="user-info">
            <div className="avatar-sidebar">
              {userInfo.ho_ten.split(" ").map((n: string) => n[0]).join("")}
            </div>
            <div className="user-details-group">
              <div className="name">{userInfo.ho_ten}</div>
              <div className="employee-id">Mã NV: {userInfo.employeeId || "N/A"}</div>
            </div>
          </div>

          <div className="user-details">
            <div className="detail-item">
              <span className="label">Phòng ban:</span>
              <span className="value">{userInfo.department}</span>
            </div>
            <div className="detail-item">
              <span className="label">Chức vụ:</span>
              <span className="value">{userInfo.role}</span>
            </div>
          </div>
        </div>

        <nav className="user-nav">
          <a className={renderPage === "trangchu" ? "active" : ""}
            onClick={() => setRenderPage("trangchu")}>🏠 Trang chủ</a>
          <a className={renderPage === "baocaoluong" ? "active" : ""}
            onClick={() => setRenderPage("baocaoluong")}>💲 Báo cáo lương</a>
          <a className={renderPage === "chamcong" ? "active" : ""}
            onClick={() => setRenderPage("chamcong")}>⏱️ Chấm công</a>
          <a className={renderPage === "taikhoan" ? "active" : ""}
            onClick={() => setRenderPage("taikhoan")}>👥 Tài khoản</a>
        </nav>
        <button className="logout-btn" onClick={onLogout}>⏎ Đăng xuất</button>
        <div className="copyright">© 2025 Hệ thống Quản lý Nhân viên</div>
      </aside>



      <main className="user-main">
        {renderPage === "trangchu" && (
          <>
            {/* ==== Phần 1: Thông tin cá nhân ==== */}
            <div className="user-card">
              <div className="user-header">
                <div>
                  <h2>{userInfo.ho_ten}</h2>
                  <p>Phòng ban: {userInfo.department}</p>
                  <p>Chức vụ: {userInfo.role}</p>
                  <p><i className="icon-company"></i></p>
                </div>
                <div className="user-avatar-circle">
                  {userInfo.ho_ten.split(" ").map((n: string) => n[0]).join("")}
                </div>
              </div>
            </div>

            {/* ==== Phần 2: Thống kê tháng ==== */}
            <div className="user-cardh1">
              <div className="stats-section">
                <h3 className="bao-cao-header">Thống kê tháng</h3>
                <div className="stat-item">
                  <span>Số buổi làm việc</span>
                  <span>{workDays}</span>
                </div>
                <div className="stat-item">
                  <span>Tổng giờ làm việc</span>
                  <span>{totalHours} giờ</span>
                </div>
                <div className="stat-item">
                  <span>Lương cơ bản</span>
                  <span>{parseFloat(userInfo.luong_co_ban || "0").toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="stat-item">
                  <span>Lương làm thêm</span>
                  <span>0 ₫</span>
                </div>
                <div className="stat-total">
                  <span>Tổng dự kiến</span>
                  <span>
                    {(
                      totalHours >= 40
                        ? parseFloat(userInfo.luong_co_ban || "0")
                        : 0
                    ).toLocaleString('vi-VN')} ₫
                  </span>
                </div>
                {totalHours < 40 && (
                  <p className="note-text">
                    * Chưa đủ 40 giờ làm việc trong tháng nên tạm thời chưa được tính lương cứng.
                  </p>
                )}
              </div>
            </div>
            <div className="user-cardh1">
              <div className="stats-section">
                <h3 className="bao-cao-header" >Kết quả trong ngày</h3>
                <div className="stats-section1" style={{ textAlign: "center", width: "100%" }}>
                  {todayAttendance ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ borderBottom: "1px solid #e0e0e0", paddingBottom: "12px" }}>
                        <h4 style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>🌅 Buổi sáng</h4>
                        <p style={{ margin: "4px 0" }}>Check-in: <strong>{todayAttendance.checkin_sang || "--:--"}</strong></p>
                        <p style={{ margin: "4px 0" }}>Check-out: <strong>{todayAttendance.checkout_sang || "--:--"}</strong></p>
                      </div>
                      <div style={{ paddingTop: "12px" }}>
                        <h4 style={{ margin: "0 0 8px 0", color: "#666", fontSize: "14px" }}>🌆 Buổi chiều</h4>
                        <p style={{ margin: "4px 0" }}>Check-in: <strong>{todayAttendance.checkin_chieu || "--:--"}</strong></p>
                        <p style={{ margin: "4px 0" }}>Check-out: <strong>{todayAttendance.checkout_chieu || "--:--"}</strong></p>
                      </div>
                      <div style={{ marginTop: "8px", paddingTop: "12px", borderTop: "1px solid #e0e0e0" }}>
                        <p style={{ margin: "4px 0", fontWeight: "bold", color: "#2563eb" }}>
                          Tổng giờ: {todayAttendance.tong_gio || 0}h
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="no-record">Không có bản ghi chấm công nào hôm nay</p>
                  )}
                </div>
              </div>
            </div>

            <div className="two-small-cards">
              {/* CARD 1 */}
              <div className="small-card-box flex items-center gap-4">
                {/* ICON CLOCK */}
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div>
                  <h3>Giờ đã làm</h3>
                  <p className="value">{totalHours}h</p>
                </div>
              </div>

              {/* CARD 2 */}
              <div className="small-card-box flex items-center gap-4">
                {/* ICON TREND */}
                <div className="w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 17l6-6 4 4 8-8" />
                  </svg>
                </div>

                <div>
                  <h3>Giờ làm thêm</h3>
                  <p className="value">0h</p>
                </div>
              </div>
            </div>
          </>
        )}

        {renderPage === "chamcong" && <ListChamCongNV maNhanVien={maNhanVien} />}
        {renderPage === "baocaoluong" && <BaoCaoLuongNV maNhanVien={maNhanVien} />}
        {renderPage === "taikhoan" && <ListTaiKhoanNV username={username} />}
      </main>

    </div>
  );
}
