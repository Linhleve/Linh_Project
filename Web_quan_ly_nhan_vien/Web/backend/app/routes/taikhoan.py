from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from decimal import Decimal
from datetime import date, timedelta
import uuid
import random

from app.db import get_session
from app.db_models import NhanVien, User, PhongBan, ChucVu, ChamCong, Luong

router = APIRouter()


@router.get("/", response_description="Get all users")
async def get_users(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(User))
    users = result.scalars().all()
    return [
        {"id": user.id, "username": user.username, "ho_ten": user.ho_ten}
        for user in users
    ]


@router.get("/{username}", response_description="Get user info")
async def get_user(username: str, session: AsyncSession = Depends(get_session)):
    user = await session.scalar(select(User).where(User.username == username))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    department = "Unknown"
    department_name = "Unknown"
    employee_id = "Unknown"
    chuc_vu = "Unknown"
    chuc_vu_name = "Unknown"
    muc_luong_co_ban = "0"

    if user.ma_nhan_vien:
        nv = await session.get(NhanVien, user.ma_nhan_vien)
        if nv:
            employee_id = nv.ma_nhan_vien
            department = nv.ma_phong
            muc_luong_co_ban = str(nv.muc_luong_co_ban or 0)

            # Lấy tên phòng ban
            if nv.ma_phong:
                pb = await session.get(PhongBan, nv.ma_phong)
                if pb:
                    department_name = pb.ten_phong

            # Lấy tên chức vụ
            if nv.ma_chuc_vu:
                cv = await session.get(ChucVu, nv.ma_chuc_vu)
                if cv:
                    chuc_vu = nv.ma_chuc_vu
                    chuc_vu_name = cv.ten_chuc_vu

    return {
        "name": user.ho_ten,
        "email": f"{username}@example.com",
        "username": user.username,
        "department": department_name,
        "department_code": department,
        "employeeId": employee_id,
        "chuc_vu": chuc_vu_name,
        "chuc_vu_code": chuc_vu,
        "muc_luong_co_ban": muc_luong_co_ban,
        "role": "Admin" if username == "admin" else "User",
    }


@router.put("/{username}", response_description="Update user password")
async def update_user(
    username: str,
    data: dict = Body(...),
    session: AsyncSession = Depends(get_session),
):
    user = await session.scalar(select(User).where(User.username == username))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if "password_new" in data:
        stmt = (
            update(User)
            .where(User.username == username)
            .values(password=data["password_new"])
        )
        await session.execute(stmt)
        await session.commit()
        return {"message": "Password updated"}

    return {"message": "No changes"}


@router.post("/reset-data")
async def reset_data(session: AsyncSession = Depends(get_session)):
    """
    Xóa hết dữ liệu trong DB, chỉ giữ lại tài khoản admin (username='admin').
    Dùng để reset dữ liệu test.
    """
    # 1. Xóa tất cả user KHÔNG phải admin trước (do có FK tới NhanVien)
    await session.execute(delete(User).where(User.username != "admin"))

    # 2. Xóa các bản ghi lương, chấm công, nhân viên, phòng ban, chức vụ
    await session.execute(delete(Luong))
    await session.execute(delete(ChamCong))
    await session.execute(delete(NhanVien))
    await session.execute(delete(PhongBan))
    await session.execute(delete(ChucVu))

    await session.commit()

    return {"message": "Đã reset dữ liệu, chỉ giữ lại tài khoản admin"}


@router.post("/seed-demo-employees")
async def seed_demo_employees(session: AsyncSession = Depends(get_session)):
    """
    Tạo khoảng 50 nhân viên demo với phòng ban, chức vụ, lương cơ bản và mã NV đúng quy tắc.
    """
    # Đảm bảo có một số phòng ban demo
    demo_phongbans = [
        {"ma_phong": "PDT", "ten_phong": "Phòng Đào tạo", "nam_thanh_lap": "2015", "trang_thai": "Hoạt động"},
        {"ma_phong": "PNS", "ten_phong": "Phòng Nhân sự", "nam_thanh_lap": "2016", "trang_thai": "Hoạt động"},
        {"ma_phong": "PKT", "ten_phong": "Phòng Kế toán", "nam_thanh_lap": "2014", "trang_thai": "Hoạt động"},
        {"ma_phong": "PKD", "ten_phong": "Phòng Kinh doanh", "nam_thanh_lap": "2018", "trang_thai": "Hoạt động"},
    ]

    for pb_data in demo_phongbans:
        existing_pb = await session.get(PhongBan, pb_data["ma_phong"])
        if not existing_pb:
            session.add(PhongBan(**pb_data))

    # Đảm bảo có các chức vụ cơ bản (TP, PP, NV) - trùng với seed_default_chucvu
    demo_chucvu_defs = [
        {"ma_chuc_vu": "TP", "ten_chuc_vu": "Trưởng phòng"},
        {"ma_chuc_vu": "PP", "ten_chuc_vu": "Phó phòng"},
        {"ma_chuc_vu": "NV", "ten_chuc_vu": "Nhân viên"},
    ]

    for cv_data in demo_chucvu_defs:
        existing_cv = await session.get(ChucVu, cv_data["ma_chuc_vu"])
        if not existing_cv:
            session.add(ChucVu(**cv_data))

    demo_chucvus = [cv["ma_chuc_vu"] for cv in demo_chucvu_defs]

    # Lấy thứ tự hiện tại lớn nhất
    result = await session.execute(select(func.max(NhanVien.thu_tu_vao_cong_ty)))
    current_max = result.scalar() or 0
    next_order = current_max

    created = 0
    total_chamcong = 0
    for i in range(1, 51):
        next_order += 1
        order_str = f"{next_order:04d}"

        pb = demo_phongbans[(i - 1) % len(demo_phongbans)]
        ma_phong = pb["ma_phong"]
        ma_chuc_vu = demo_chucvus[(i - 1) % len(demo_chucvus)]

        ma_nhan_vien = f"{ma_phong}{ma_chuc_vu}{order_str}"

        # Tạo nhân viên
        base_salary = Decimal("8000000") + Decimal(str((i % 5) * 500000))
        nv = NhanVien(
            ma_nhan_vien=ma_nhan_vien,
            ho_ten=f"Nhân viên {i:02d}",
            ma_phong=ma_phong,
            ma_chuc_vu=ma_chuc_vu,
            muc_luong_co_ban=base_salary,
            thu_tu_vao_cong_ty=next_order,
        )
        session.add(nv)

        # Tạo tài khoản tương ứng cho nhân viên
        username = f"nv{i:02d}"
        user = User(
            id=str(uuid.uuid4()),
            username=username,
            password="123456",
            ho_ten=nv.ho_ten,
            ma_nhan_vien=ma_nhan_vien,
        )
        session.add(user)

        # Tạo dữ liệu chấm công cho TẤT CẢ các ngày trong tháng hiện tại
        today = date.today()
        current_year = today.year
        current_month = today.month
        
        # Tính ngày đầu và cuối tháng hiện tại
        first_day_of_month = date(current_year, current_month, 1)
        if current_month == 12:
            last_day_of_month = date(current_year + 1, 1, 1) - timedelta(days=1)
        else:
            last_day_of_month = date(current_year, current_month + 1, 1) - timedelta(days=1)
        
        # Tạo chấm công cho từng ngày trong tháng (chỉ các ngày đã qua, không tạo ngày tương lai)
        chamcong_count = 0
        current_date = first_day_of_month
        while current_date <= today and current_date <= last_day_of_month:
            # Bỏ qua chủ nhật (ngày 6 trong tuần, 0=Monday, 6=Sunday)
            if current_date.weekday() != 6:  # Không phải chủ nhật
                # Một số nhân viên có thể nghỉ ngẫu nhiên (10% cơ hội)
                if random.random() > 0.1:  # 90% đi làm
                    # Giờ làm việc có thể thay đổi một chút để tự nhiên hơn
                    checkin_sang_hour = 7 + random.randint(0, 1)  # 7-8 giờ
                    checkin_sang_min = random.choice([0, 15, 30])
                    checkout_sang_hour = 11 + random.randint(0, 1)  # 11-12 giờ
                    checkout_sang_min = random.choice([0, 15, 30, 45])
                    
                    checkin_chieu_hour = 13 + random.randint(0, 1)  # 13-14 giờ
                    checkin_chieu_min = random.choice([0, 15, 30])
                    checkout_chieu_hour = 17 + random.randint(0, 1)  # 17-18 giờ
                    checkout_chieu_min = random.choice([0, 15, 30, 45])
                    
                    checkin_sang_str = f"{checkin_sang_hour:02d}:{checkin_sang_min:02d}:00"
                    checkout_sang_str = f"{checkout_sang_hour:02d}:{checkout_sang_min:02d}:00"
                    checkin_chieu_str = f"{checkin_chieu_hour:02d}:{checkin_chieu_min:02d}:00"
                    checkout_chieu_str = f"{checkout_chieu_hour:02d}:{checkout_chieu_min:02d}:00"
                    
                    # Set checkin/checkout tổng quát (checkin = sớm nhất, checkout = muộn nhất)
                    checkin_total = checkin_sang_str  # Buổi sáng sớm hơn
                    checkout_total = checkout_chieu_str  # Buổi chiều muộn hơn
                    
                    cc = ChamCong(
                        id=str(uuid.uuid4()),
                        ma_nhan_vien=ma_nhan_vien,
                        ngay=current_date,
                        checkin=checkin_total,
                        checkout=checkout_total,
                        checkin_sang=checkin_sang_str,
                        checkout_sang=checkout_sang_str,
                        checkin_chieu=checkin_chieu_str,
                        checkout_chieu=checkout_chieu_str,
                    )
                    session.add(cc)
                    chamcong_count += 1
                    total_chamcong += 1
            current_date += timedelta(days=1)
        
        # Tạo chấm công cho tháng trước (để có dữ liệu demo đầy đủ hơn)
        prev_month = current_month - 1
        prev_year = current_year
        if prev_month == 0:
            prev_month = 12
            prev_year -= 1
        
        prev_first_day = date(prev_year, prev_month, 1)
        if prev_month == 12:
            prev_last_day = date(prev_year + 1, 1, 1) - timedelta(days=1)
        else:
            prev_last_day = date(prev_year, prev_month + 1, 1) - timedelta(days=1)
        
        prev_date = prev_first_day
        while prev_date <= prev_last_day:
            if prev_date.weekday() != 6:  # Không phải chủ nhật
                if random.random() > 0.1:  # 90% đi làm
                    checkin_sang_hour = 7 + random.randint(0, 1)
                    checkin_sang_min = random.choice([0, 15, 30])
                    checkout_sang_hour = 11 + random.randint(0, 1)
                    checkout_sang_min = random.choice([0, 15, 30, 45])
                    
                    checkin_chieu_hour = 13 + random.randint(0, 1)
                    checkin_chieu_min = random.choice([0, 15, 30])
                    checkout_chieu_hour = 17 + random.randint(0, 1)
                    checkout_chieu_min = random.choice([0, 15, 30, 45])
                    
                    checkin_sang_str = f"{checkin_sang_hour:02d}:{checkin_sang_min:02d}:00"
                    checkout_sang_str = f"{checkout_sang_hour:02d}:{checkout_sang_min:02d}:00"
                    checkin_chieu_str = f"{checkin_chieu_hour:02d}:{checkin_chieu_min:02d}:00"
                    checkout_chieu_str = f"{checkout_chieu_hour:02d}:{checkout_chieu_min:02d}:00"
                    
                    # Set checkin/checkout tổng quát
                    checkin_total = checkin_sang_str
                    checkout_total = checkout_chieu_str
                    
                    cc = ChamCong(
                        id=str(uuid.uuid4()),
                        ma_nhan_vien=ma_nhan_vien,
                        ngay=prev_date,
                        checkin=checkin_total,
                        checkout=checkout_total,
                        checkin_sang=checkin_sang_str,
                        checkout_sang=checkout_sang_str,
                        checkin_chieu=checkin_chieu_str,
                        checkout_chieu=checkout_chieu_str,
                    )
                    session.add(cc)
                    chamcong_count += 1
                    total_chamcong += 1
            prev_date += timedelta(days=1)

        # Tạo dữ liệu lương mẫu cho tháng hiện tại và tháng trước
        thang_nam_hien_tai = today.strftime("%Y-%m")
        thang_nam_truoc = f"{prev_year:04d}-{prev_month:02d}"
        
        # Lương tháng hiện tại (sẽ được tính tự động sau khi có chấm công)
        luong_hien_tai = Luong(
            id=str(uuid.uuid4()),
            ma_nhan_vien=ma_nhan_vien,
            thang_nam=thang_nam_hien_tai,
            tong_gio_lam=Decimal("0"),  # Sẽ được tính lại sau
            gio_tang_ca=Decimal("0"),
            luong_co_ban=base_salary,
            luong_tang_ca=Decimal("0"),
            luong_thuc_nhan=base_salary,
            ngay_tinh=today,
            ghi_chu="Dữ liệu lương demo - sẽ được tính tự động",
        )
        session.add(luong_hien_tai)
        
        # Lương tháng trước (có dữ liệu mẫu)
        tong_gio_thang_truoc = Decimal(str(160 + random.randint(-20, 20)))  # 140-180 giờ
        gio_tang_ca_thang_truoc = max(Decimal("0"), tong_gio_thang_truoc - Decimal("40"))
        hourly_rate = base_salary / Decimal("40")
        luong_tang_ca_thang_truoc = gio_tang_ca_thang_truoc * hourly_rate * Decimal("1.5") if gio_tang_ca_thang_truoc > 0 else Decimal("0")
        luong_thuc_nhan_thang_truoc = base_salary + luong_tang_ca_thang_truoc
        
        luong_thang_truoc = Luong(
            id=str(uuid.uuid4()),
            ma_nhan_vien=ma_nhan_vien,
            thang_nam=thang_nam_truoc,
            tong_gio_lam=tong_gio_thang_truoc,
            gio_tang_ca=gio_tang_ca_thang_truoc,
            luong_co_ban=base_salary,
            luong_tang_ca=luong_tang_ca_thang_truoc,
            luong_thuc_nhan=luong_thuc_nhan_thang_truoc,
            ngay_tinh=prev_last_day,
            ghi_chu="Dữ liệu lương demo tháng trước",
        )
        session.add(luong_thang_truoc)

        created += 1

    await session.commit()

    return {
        "message": f"Đã tạo {created} nhân viên demo với đầy đủ dữ liệu",
        "from_order": current_max + 1,
        "to_order": next_order,
        "total_chamcong": total_chamcong,
        "total_users": created,
        "total_luong": created * 2,  # 2 tháng lương cho mỗi nhân viên
    }
