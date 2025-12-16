import React, { useEffect, useState } from "react";
import "../css/ChamCong_nv.css";
import axios from "axios";

interface ChamCong {
  id: string;
  ma_nhan_vien: string;
  ngay: string;
  checkin: string;       // tổng quát: check-in đầu tiên trong ngày
  checkout: string;      // tổng quát: check-out cuối cùng trong ngày
  checkin_sang: string;
  checkout_sang: string;
  checkin_chieu: string;
  checkout_chieu: string;
}

interface TimeChamCong {
  checkin_sang: string;
  checkout_sang: string;
  checkin_chieu: string;
  checkout_chieu: string;
}

interface ListChamCongNVProps {
  maNhanVien: string | null;
}

const ListChamCongNV: React.FC<ListChamCongNVProps> = ({ maNhanVien }) => {
  const [chamCong, setChamCong] = useState<ChamCong[]>([]);
  const [timeChamCong, setTimeChamCong] = useState<TimeChamCong>({
    checkin_sang: "",
    checkout_sang: "",
    checkin_chieu: "",
    checkout_chieu: "",
  });
  const [formChamCong, setFormChamCong] = useState(false)
  const [dateTime, setDateTime] = useState(new Date().toISOString().split('T')[0])
  const [currentTime, setCurrentTime] = useState(new Date());

  const isWithinWorkingHours = (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Buổi sáng: 8:00 - 12:00
    const inMorning =
      (hour > 8 || (hour === 8 && minute >= 0)) &&
      hour < 12;

    // Buổi chiều: 13:30 - 17:30
    const inAfternoon =
      (hour > 13 || (hour === 13 && minute >= 30)) &&
      (hour < 17 || (hour === 17 && minute <= 30));

    return inMorning || inAfternoon;
  };

  // Hàm kiểm tra trạng thái đi muộn/dúng giờ
  const checkLateStatus = (time: string, shift: "morning" | "afternoon") => {
    if (!time) return null;

    const [h, m] = time.split(":").map(Number);

    if (shift === "morning") {
      // Chuẩn 08:00
      if (h > 8 || (h === 8 && m > 0)) return "late";
      return "ontime";
    }

    // afternoon → Chuẩn 13:30
    if (h > 13 || (h === 13 && m > 30)) return "late";
    return "ontime";
  };

  // Hàm kiểm tra trạng thái về sớm / đúng giờ khi checkout
  const checkEarlyStatus = (time: string, shift: "morning" | "afternoon") => {
    if (!time) return null;

    const [h, m] = time.split(":").map(Number);

    if (shift === "morning") {
      // Kết thúc buổi sáng 12:00 -> về trước 12:00 là sớm
      if (h < 12) return "early";
      return "ontime";
    }

    // Buổi chiều kết thúc 17:30 -> về trước 17:30 là sớm
    if (h < 17 || (h === 17 && m < 30)) return "early";
    return "ontime";
  };

  if (!maNhanVien) {
    return <div>Không có thông tin nhân viên. Vui lòng đăng nhập lại.</div>;
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchMyAttendance();
    return () => clearInterval(timer);
  }, []);

  const fetchMyAttendance = async () => {
    if (!maNhanVien) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/chamcong/my-attendance/${maNhanVien}`);
      setChamCong(res.data);

      // Check if checked in today
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = res.data.find((cc: ChamCong) => cc.ngay === today);
      if (todayRecord) {
        setTimeChamCong({
          checkin_sang: todayRecord.checkin_sang,
          checkout_sang: todayRecord.checkout_sang,
          checkin_chieu: todayRecord.checkin_chieu,
          checkout_chieu: todayRecord.checkout_chieu,
        });
      }
    } catch (error) {
      console.error("Error fetching my attendance:", error);
    }
  }

  const handleCheckInOut = async () => {
    if (!maNhanVien) {
      alert("Không có thông tin nhân viên");
      return;
    }
    const time = currentTime.toLocaleTimeString("vi-VN", { hour12: false });

    // Không cho chấm công ngoài giờ làm việc
    if (!isWithinWorkingHours(currentTime)) {
      alert("Hiện đang ngoài giờ làm việc chính thức (8:00-12:00, 13:30-17:30), không thể chấm công.");
      return;
    }

    // Xác định action hợp lý tiếp theo dựa trên trạng thái hiện tại + thời gian
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();

    let type: "checkin" | "checkout";

    // Buổi sáng: 8:00 - 12:00
    if (hour < 12) {
      if (!timeChamCong.checkin_sang) {
        type = "checkin";
      } else if (!timeChamCong.checkout_sang) {
        type = "checkout";
      } else {
        alert("Bạn đã hoàn thành check-in/check-out buổi sáng.");
        return;
      }
    } else if (hour > 13 || (hour === 13 && minute >= 30)) {
      // Buổi chiều: từ 13:30 trở đi
      if (!timeChamCong.checkin_chieu) {
        type = "checkin";
      } else if (!timeChamCong.checkout_chieu) {
        type = "checkout";
      } else {
        alert("Bạn đã hoàn thành check-in/check-out buổi chiều.");
        return;
      }
    } else {
      // Trường hợp 12:00 - 13:29 (không nằm trong working hours ở trên nên đã return rồi),
      // code này về cơ bản sẽ không chạy tới, chỉ để an toàn.
      alert("Hiện đang trong giờ nghỉ trưa (12:00 - 13:30), không thể chấm công.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/chamcong/", {
        ma_nhan_vien: maNhanVien,
        time: time,
        type: type
      });

      // Cập nhật state tạm thời (server vẫn là nguồn chính, sẽ sync lại bằng fetchMyAttendance)
      if (type === "checkin") {
        if (hour < 12) {
          setTimeChamCong((prev) => ({ ...prev, checkin_sang: time }));
        } else {
          setTimeChamCong((prev) => ({ ...prev, checkin_chieu: time }));
        }
      } else {
        if (hour < 12) {
          setTimeChamCong((prev) => ({ ...prev, checkout_sang: time }));
        } else {
          setTimeChamCong((prev) => ({ ...prev, checkout_chieu: time }));
        }
      }

      // Tự đóng form khi đã đủ cả 2 buổi
      setTimeout(() => {
        setFormChamCong(false);
      }, 1500);
      fetchMyAttendance();
    } catch (error) {
      alert("Lỗi chấm công: " + error);
    }
  };

  const filteredChamCong = chamCong.filter(cc => cc.ngay === dateTime);

  return (
    <div className="cham-cong-container">
      <div className="cham-cong-header">
        <div className="content_header">
          <h4> Quản Lý Chấm Công </h4>
          <p> Quản lý thời gian làm việc của bạn </p>
        </div>
        <div className="content_header_button">
          <button onClick={() => setFormChamCong(true)}>🕔 Chấm công nhanh</button>
        </div>
      </div>

      <div className="content_header_time">
        <div className="content_title_text">
          <h4>Chọn ngày</h4>
          <p>Xem danh sách chấm công theo ngày</p>
        </div>
        <div className="content_title_time">
          <input
            type="date"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
        </div>
      </div>

      <div className="content_header_main">
        <div className="main_detail_label">
          <h4> Danh sách chấm công </h4>
          <p> Lịch bạn đã chấm công ngày {dateTime} </p>
        </div>
        <div className="main_detail_table">
          <table>
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>🕔Buổi sáng (8:00 - 12:00)</th>
                <th>🕔Buổi chiều (13:30 - 17:30)</th>
              </tr>
            </thead>
            <tbody>
              {filteredChamCong.length > 0 ? filteredChamCong.map(cc => (
                <tr key={cc.id}>
                  <td>{cc.ma_nhan_vien}</td>
                  <td>
                    Check In: {cc.checkin_sang || "--:--"}
                              {cc.checkin_sang && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    color:
                                      checkLateStatus(cc.checkin_sang, "morning") === "late"
                                        ? "red"
                                        : "green",
                                    fontWeight: 500,
                                  }}
                                >
                                  (
                                  {checkLateStatus(cc.checkin_sang, "morning") === "late"
                                    ? "Muộn"
                                    : "Đúng giờ"}
                                  )
                                </span>
                              )}
                    <br />
                    Check Out: {cc.checkout_sang || "--:--"}
                              {cc.checkout_sang && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    color:
                                      checkEarlyStatus(cc.checkout_sang, "morning") === "early"
                                        ? "red"
                                        : "green",
                                    fontWeight: 500,
                                  }}
                                >
                                  (
                                  {checkEarlyStatus(cc.checkout_sang, "morning") === "early"
                                    ? "Sớm"
                                    : "Đúng giờ"}
                                  )
                                </span>
                              )}
                  </td>
                  <td>
                    Check In: {cc.checkin_chieu || "--:--"}
                              {cc.checkin_chieu && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    color:
                                      checkLateStatus(cc.checkin_chieu, "afternoon") === "late"
                                        ? "red"
                                        : "green",
                                    fontWeight: 500,
                                  }}
                                >
                                  (
                                  {checkLateStatus(cc.checkin_chieu, "afternoon") === "late"
                                    ? "Muộn"
                                    : "Đúng giờ"}
                                  )
                                </span>
                              )}
                    <br />
                    Check Out: {cc.checkout_chieu || "--:--"}
                              {cc.checkout_chieu && (
                                <span
                                  style={{
                                    marginLeft: 6,
                                    color:
                                      checkEarlyStatus(cc.checkout_chieu, "afternoon") === "early"
                                        ? "red"
                                        : "green",
                                    fontWeight: 500,
                                  }}
                                >
                                  (
                                  {checkEarlyStatus(cc.checkout_chieu, "afternoon") === "early"
                                    ? "Sớm"
                                    : "Đúng giờ"}
                                  )
                                </span>
                              )}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center" }}>Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="content_header_note">
        <h4>🕔 Quy định giờ làm việc:</h4>
        <li>Buổi sáng: 8:00 - 12:00 (4 giờ)</li>
        <li>Buổi chiều: 13:30 - 17:30 (4 giờ)</li>
        <li>Check-in muộn hơn giờ quy định sẽ được đánh dấu màu đỏ</li>
        <li>Check-in đúng giờ hoặc sớm sẽ được đánh dấu màu xanh</li>
      </div>


      {formChamCong && (
        <div className="content_check_inout">
          <div className="button_exitform">
            <button onClick={() => setFormChamCong(false)}>✖</button>
          </div>
          <div className="header_wellcome">
            <h4> Wellcome, Hãy Chấm Công Nào!</h4>
            <p>
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="header_time_now">
            {currentTime.toLocaleTimeString("vi-VN", { hour12: false })}
          </div>
          {!isWithinWorkingHours(currentTime) && (
            <div style={{ color: "red", marginTop: "8px", fontWeight: 500 }}>
              Ngoài khung giờ làm việc chính thức (8:00-12:00, 13:30-17:30) - không thể chấm công
            </div>
          )}
          <div className="time_checkin">
            <h4>Buổi sáng - CheckIn / CheckOut</h4>
            <p>CheckIn: {timeChamCong.checkin_sang || "--:--:--"}</p>
            <p>CheckOut: {timeChamCong.checkout_sang || "--:--:--"}</p>
          </div>
          <div className="time_checkout">
            <h4>Buổi chiều - CheckIn / CheckOut</h4>
            <p>CheckIn: {timeChamCong.checkin_chieu || "--:--:--"}</p>
            <p>CheckOut: {timeChamCong.checkout_chieu || "--:--:--"}</p>
          </div>
          <div className="checkin_button">
            <button
              onClick={handleCheckInOut}
            >
              Chấm công / kết ca
            </button>

          </div>
        </div>
      )}


    </div>
  );
};

export default ListChamCongNV;
