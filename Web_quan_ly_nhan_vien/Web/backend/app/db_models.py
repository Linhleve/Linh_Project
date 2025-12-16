from datetime import datetime
from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from app.db import Base


class PhongBan(Base):
    __tablename__ = "phongban"

    ma_phong = Column(String(10), primary_key=True)
    ten_phong = Column(String(255), nullable=False)
    nam_thanh_lap = Column(String(10), nullable=False)
    trang_thai = Column(String(50), nullable=False)

    nhanviens = relationship("NhanVien", back_populates="phongban")


class ChucVu(Base):
    __tablename__ = "chucvu"

    ma_chuc_vu = Column(String(10), primary_key=True)
    ten_chuc_vu = Column(String(255), nullable=False)

    nhanviens = relationship("NhanVien", back_populates="chucvu")


class NhanVien(Base):
    __tablename__ = "nhanvien"

    ma_nhan_vien = Column(String(10), primary_key=True)
    ho_ten = Column(String(255), nullable=False)
    ma_phong = Column(String(10), ForeignKey("phongban.ma_phong"))
    ma_chuc_vu = Column(String(10), ForeignKey("chucvu.ma_chuc_vu"))
    muc_luong_co_ban = Column(Numeric(14, 2), nullable=False, default=0)
    # Thứ tự vào công ty (dùng để sinh mã nhân viên theo đúng quy tắc)
    thu_tu_vao_cong_ty = Column(Integer, nullable=True)
    trang_thai = Column(String(50), nullable=False, default="Hoạt động")  # "Hoạt động" hoặc "Đã ẩn"

    phongban = relationship("PhongBan", back_populates="nhanviens")
    chucvu = relationship("ChucVu", back_populates="nhanviens")
    chamcongs = relationship("ChamCong", back_populates="nhanvien")
    luongs = relationship("Luong", back_populates="nhanvien")


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    username = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    ho_ten = Column(String(255), nullable=False)
    ma_nhan_vien = Column(String(10), ForeignKey("nhanvien.ma_nhan_vien"), nullable=True)


class ChamCong(Base):
    __tablename__ = "chamcong"
    __table_args__ = (
        UniqueConstraint("ma_nhan_vien", "ngay", name="uq_chamcong_nv_ngay"),
    )

    id = Column(String(36), primary_key=True)
    ma_nhan_vien = Column(String(10), ForeignKey("nhanvien.ma_nhan_vien"))
    ngay = Column(Date, nullable=False)
    # Các cột cũ (giữ lại để tương thích, sẽ được fill tự động từ các buổi)
    checkin = Column(String(8), nullable=True)
    checkout = Column(String(8), nullable=True)

    # Chấm công theo 2 buổi: sáng / chiều
    checkin_sang = Column(String(8), nullable=True)
    checkout_sang = Column(String(8), nullable=True)
    checkin_chieu = Column(String(8), nullable=True)
    checkout_chieu = Column(String(8), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    nhanvien = relationship("NhanVien", back_populates="chamcongs")


class Luong(Base):
    __tablename__ = "luong"

    id = Column(String(36), primary_key=True)
    ma_nhan_vien = Column(String(10), ForeignKey("nhanvien.ma_nhan_vien"))
    thang_nam = Column(String(7), nullable=False)  # YYYY-MM
    tong_gio_lam = Column(Numeric(10, 2), nullable=False, default=0)
    gio_tang_ca = Column(Numeric(10, 2), nullable=False, default=0)
    luong_co_ban = Column(Numeric(14, 2), nullable=False, default=0)
    luong_tang_ca = Column(Numeric(14, 2), nullable=False, default=0)
    luong_thuc_nhan = Column(Numeric(14, 2), nullable=False, default=0)
    ngay_tinh = Column(Date, nullable=False)
    ghi_chu = Column(Text, nullable=True)

    nhanvien = relationship("NhanVien", back_populates="luongs")

