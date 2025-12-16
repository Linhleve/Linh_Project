from pydantic import BaseModel, Field
from typing import Optional

class NhanVienSchema(BaseModel):
    ho_ten: str = Field(...)
    ma_phong: str = Field(...)
    ma_chuc_vu: str = Field(...)
    muc_luong_co_ban: str = Field(...)
    # Thông tin tài khoản (tùy chọn) để tạo luôn user cho nhân viên
    username: Optional[str] = None
    password: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "ho_ten": "Nguyen Van A",
                "ma_phong": "PB01",
                "ma_chuc_vu": "CV01",
                "muc_luong_co_ban": "10000000",
                "username": "nguyenvana",
                "password": "123456",
            }
        }

class UpdateNhanVienSchema(BaseModel):
    ho_ten_moi: Optional[str] = None
    ma_phong_moi: Optional[str] = None
    ma_chuc_vu_moi: Optional[str] = None
    muc_luong_co_ban_moi: Optional[str] = None

class PhongBanSchema(BaseModel):
    ma_phong: str = Field(...)
    ten_phong: str = Field(...)
    nam_thanh_lap: str = Field(...)
    trang_thai: str = Field(...)

class UpdatePhongBanSchema(BaseModel):
    ma_phong_ban_moi: Optional[str] = None
    ten_phong_ban_moi: Optional[str] = None
    nam_thanh_lap_moi: Optional[str] = None
    trang_thai_moi: Optional[str] = None

class ChucVuSchema(BaseModel):
    ma_chuc_vu: str = Field(...)
    ten_chuc_vu: str = Field(...)

class UpdateChucVuSchema(BaseModel):
    ma_chuc_vu_moi: Optional[str] = None
    ten_chuc_vu_moi: Optional[str] = None

# --- NEW SCHEMAS ---

class UserRegisterSchema(BaseModel):
    ho_ten: str = Field(...)
    username: str = Field(...)
    password: str = Field(...)

class UserLoginSchema(BaseModel):
    username: str = Field(...)
    password: str = Field(...)

class ChamCongSchema(BaseModel):
    ma_nhan_vien: str = Field(...)
    ngay: str = Field(...) # YYYY-MM-DD
    checkin: Optional[str] = None
    checkout: Optional[str] = None

class CheckInCheckOutSchema(BaseModel):
    ma_nhan_vien: str = Field(...)
    time: str = Field(...) # HH:MM:SS
    type: str = Field(...) # "checkin" or "checkout"
