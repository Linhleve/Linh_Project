import { useState } from "react";
import "../css/DangKy.css";
import axios from "axios";

export default function DangKy({ onBack }: { onBack: () => void }) {
  const [fullName, setFullName] = useState("");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !user || !pass || !confirm) {
      alert("⚠ Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (pass !== confirm) {
      alert("❌ Mật khẩu không khớp!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/auth/register", {
        ho_ten: fullName,
        username: user,
        password: pass
      });
      alert("✅ Đăng ký thành công! Vui lòng đăng nhập lại.");
      onBack();
    } catch (error) {
      alert("❌ Đăng ký thất bại! Tên đăng nhập có thể đã tồn tại.");
    }
  };

  return (
    <div className="dk-page">
      < div className="dk-box">

        <div className="dk-header">
          <h2>Đăng ký tài khoản</h2>
          <p>Tạo tài khoản mới để bắt đầu</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="dk-group">
            <label>Họ và tên</label>
            <input
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="dk-group">
            <label>Tên đăng nhập</label>
            <input
              placeholder="username"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>

          <div className="dk-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          <div className="dk-group">
            <label>Xác nhận mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button type="submit" className="dk-btn">Đăng ký</button>

          <p className="dk-link">
            Đã có tài khoản?{" "}
            <span onClick={onBack} className="dk-login">
              Đăng nhập
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
