import { useEffect, useState } from "react";
import '../css/ThongTin_nv.css';
import axios from 'axios';

interface TaiKhoan {
  name: string;
  email: string;
  username: string;
  department: string;
  employeeId: string;
  role: string;
}

interface ListTaiKhoanNVProps {
  username: string;
}

const ListTaiKhoanNV: React.FC<ListTaiKhoanNVProps> = ({ username }) => {
  const [userInfo, setUserInfo] = useState<TaiKhoan | null>(null);
  const [ChangePasswordForm, setChangePasswordForm] = useState(false);
  const [passwordCu, setPasswordCu] = useState("");
  const [passwordMoi, setPasswordMoi] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    axios
      .get<TaiKhoan>(`http://localhost:5000/api/taikhoan/${username}`)
      .then((res) => setUserInfo({...res.data, role: "Nhân viên"}))
      .catch((err) => console.error("Lỗi khi lấy dữ liệu:", err));
  };


  const handleUpdatePassword = async () => {
    if (!passwordCu || !passwordMoi || !passwordConfirm) {
      if (passwordMoi !== passwordConfirm) {
        alert("Mật khẩu mới và xác nhận mật khẩu không khớp.");
        return;
      }
      alert("Bạn chưa điền đủ thông tin.");
      return;
    }
    try {
      await axios.put(`http://localhost:5000/api/taikhoan/${username}`, {
        password_new: passwordMoi,
      });
      setPasswordCu("");
      setPasswordMoi("");
      setPasswordConfirm("");
      setChangePasswordForm(false);
      alert("Cập nhật mật khẩu thành công.");
    } catch (error) {
      console.error("Lỗi khi cập nhật mật khẩu:", error);
      alert("Cập nhật mật khẩu thất bại.");
    }
  };

  if (!userInfo) return <div>Loading...</div>;

  return (
    <div className="tai-khoan-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar-circle">
            {userInfo.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
        </div>

        <h2 className="profile-name">{userInfo.name}</h2>

        <div className="profile-details">
          <div className="profile-detail-row">
            <span className="profile-detail-label">Email</span>
            <span className="profile-detail-value">{userInfo.email}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-label">Tài khoản</span>
            <span className="profile-detail-value">{userInfo.username}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-label">Đơn vị</span>
            <span className="profile-detail-value">{userInfo.department}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-label">Mã nhân viên</span>
            <span className="profile-detail-value">{userInfo.employeeId}</span>
          </div>
          <div className="profile-detail-row">
            <span className="profile-detail-label ">Vai trò</span>
            <span className="profile-detail-value">{userInfo.role}</span>
          </div>
        </div>
      </div>

      <div className="actions-card">
        <button className="actions-button-1"
          onClick={() => setChangePasswordForm(true)}>
          <span>Đổi mật khẩu</span>
        </button>
      </div>


      {ChangePasswordForm && (
        <div className="form_overlay_nv" onClick={() => setChangePasswordForm(false)}>
          <div className="form_container_nv" onClick={(e) => e.stopPropagation()}>
            <div>
              <h4>Cập Nhật Mật Khẩu</h4>
              <p>Nhập mật khẩu hiện tại và mật khẩu mới</p>
            </div>
            <div className="form_input_nv">
              <label>Mật khẩu cũ:</label>
              <input
                type="password"
                value={passwordCu}
                onChange={(e) => setPasswordCu(e.target.value)}
              />
            </div>
            <div className="form_input_nv">
              <label>Mật khẩu mới:</label>
              <input
                type="password"
                value={passwordMoi}
                onChange={(e) => setPasswordMoi(e.target.value)}
              />
            </div>
            <div className="form_input_nv">
              <label>Nhập lại mật khẩu mới:</label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>
            <div className="form_buttons_nv">
              <div className="button_add">
                <button onClick={handleUpdatePassword}> Cập nhật mật khẩu </button>
              </div>
              <div className="button_cancel_nv">
                <button onClick={() => { setChangePasswordForm(false); setPasswordCu(""); setPasswordMoi(""); setPasswordConfirm(""); }}> Hủy </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListTaiKhoanNV;
