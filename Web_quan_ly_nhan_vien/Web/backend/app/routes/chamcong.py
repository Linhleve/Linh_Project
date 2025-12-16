import uuid
from datetime import datetime, date, timedelta, time
from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.db_models import ChamCong, NhanVien
from app.models import CheckInCheckOutSchema
from decimal import Decimal

router = APIRouter()


def serialize_cc(cc: ChamCong):
    # Tính tổng giờ làm việc từ các buổi (sáng/chiều)
    total_hours = 0.0

    def _calc_hours(checkin_str: str | None, checkout_str: str | None) -> float:
        if not checkin_str or not checkout_str:
            return 0.0
        try:
            checkin_time = datetime.strptime(checkin_str, "%H:%M:%S").time()
            checkout_time = datetime.strptime(checkout_str, "%H:%M:%S").time()
            checkin_dt = datetime.combine(cc.ngay, checkin_time)
            checkout_dt = datetime.combine(cc.ngay, checkout_time)
            if checkout_dt < checkin_dt:
                checkout_dt += timedelta(days=1)
            diff = checkout_dt - checkin_dt
            return diff.total_seconds() / 3600.0
        except (ValueError, AttributeError):
            return 0.0

    # Cộng giờ làm việc của từng buổi
    total_hours += _calc_hours(getattr(cc, "checkin_sang", None), getattr(cc, "checkout_sang", None))
    total_hours += _calc_hours(getattr(cc, "checkin_chieu", None), getattr(cc, "checkout_chieu", None))

    # Đảm bảo các field tổng quát checkin/checkout vẫn có giá trị (phục vụ các màn hình cũ)
    # checkin = thời điểm checkin đầu tiên trong ngày, checkout = checkout cuối cùng trong ngày
    all_checkins = [
        t
        for t in [
            getattr(cc, "checkin_sang", None),
            getattr(cc, "checkin_chieu", None),
            cc.checkin,
        ]
        if t
    ]
    all_checkouts = [
        t
        for t in [
            getattr(cc, "checkout_sang", None),
            getattr(cc, "checkout_chieu", None),
            cc.checkout,
        ]
        if t
    ]

    normalized_checkin = min(all_checkins) if all_checkins else ""
    normalized_checkout = max(all_checkouts) if all_checkouts else ""

    return {
        "id": cc.id,
        "ma_nhan_vien": cc.ma_nhan_vien,
        "ngay": cc.ngay.isoformat(),
        "checkin": normalized_checkin,
        "checkout": normalized_checkout,
        "checkin_sang": getattr(cc, "checkin_sang", "") or "",
        "checkout_sang": getattr(cc, "checkout_sang", "") or "",
        "checkin_chieu": getattr(cc, "checkin_chieu", "") or "",
        "checkout_chieu": getattr(cc, "checkout_chieu", "") or "",
        "tong_gio": round(total_hours, 2),
    }


@router.get("/", response_description="Get all attendance records")
async def get_chamcong(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(ChamCong))
    return [serialize_cc(cc) for cc in result.scalars().all()]


@router.post("/", response_description="Check in/out")
async def check_in_out(
    data: CheckInCheckOutSchema = Body(...),
    session: AsyncSession = Depends(get_session),
):
    today: date = datetime.now().date()

    # Kiểm tra ma_nhan_vien có tồn tại trong bảng nhanvien không
    nv = await session.get(NhanVien, data.ma_nhan_vien)
    if not nv:
        raise HTTPException(
            status_code=404,
            detail=f"Nhân viên với mã {data.ma_nhan_vien} không tồn tại"
        )

    stmt = select(ChamCong).where(
        ChamCong.ma_nhan_vien == data.ma_nhan_vien,
        ChamCong.ngay == today,
    )
    existing_record = await session.scalar(stmt)

    # Xác định buổi theo thời gian gửi lên
    try:
        current_time = datetime.strptime(data.time, "%H:%M:%S").time()
    except ValueError:
        raise HTTPException(status_code=400, detail="Thời gian không hợp lệ, định dạng HH:MM:SS")

    buoi: str
    if current_time < time(12, 0, 0):
        buoi = "sang"
    elif current_time >= time(13, 30, 0):
        buoi = "chieu"
    else:
        raise HTTPException(status_code=400, detail="Khoảng thời gian này không thuộc buổi sáng hay buổi chiều")

    # Nếu chưa có bản ghi cho hôm nay thì tạo mới
    if not existing_record:
        existing_record = ChamCong(
            id=str(uuid.uuid4()),
            ma_nhan_vien=data.ma_nhan_vien,
            ngay=today,
        )
        session.add(existing_record)

    # Helper thao tác từng buổi
    if data.type == "checkin":
        if buoi == "sang":
            if existing_record.checkin_sang:
                return {
                    "message": "Đã check-in buổi sáng rồi",
                    "record": serialize_cc(existing_record),
                }
            existing_record.checkin_sang = data.time
        else:  # buoi == "chieu"
            if existing_record.checkin_chieu:
                return {
                    "message": "Đã check-in buổi chiều rồi",
                    "record": serialize_cc(existing_record),
                }
            existing_record.checkin_chieu = data.time

        # Đồng bộ field tổng quát checkin (thời điểm checkin đầu tiên)
        if not existing_record.checkin or data.time < existing_record.checkin:
            existing_record.checkin = data.time

        await session.commit()
        await session.refresh(existing_record)
        return {"message": f"Check-in buổi {buoi} thành công", "record": serialize_cc(existing_record)}

    if data.type == "checkout":
        if buoi == "sang":
            if not existing_record.checkin_sang:
                raise HTTPException(status_code=400, detail="Chưa check-in buổi sáng, không thể check-out")
            if existing_record.checkout_sang:
                return {
                    "message": "Đã check-out buổi sáng rồi",
                    "record": serialize_cc(existing_record),
                }
            existing_record.checkout_sang = data.time
        else:  # buoi == "chieu"
            if not existing_record.checkin_chieu:
                raise HTTPException(status_code=400, detail="Chưa check-in buổi chiều, không thể check-out")
            if existing_record.checkout_chieu:
                return {
                    "message": "Đã check-out buổi chiều rồi",
                    "record": serialize_cc(existing_record),
                }
            existing_record.checkout_chieu = data.time

        # Đồng bộ field tổng quát checkout (thời điểm checkout cuối cùng)
        if not existing_record.checkout or data.time > existing_record.checkout:
            existing_record.checkout = data.time

        await session.commit()
        await session.refresh(existing_record)
        return {"message": f"Check-out buổi {buoi} thành công", "record": serialize_cc(existing_record)}

    raise HTTPException(status_code=400, detail="Invalid type")


@router.get("/my-attendance/{ma_nhan_vien}", response_description="Get my attendance")
async def get_my_attendance(
    ma_nhan_vien: str,
    session: AsyncSession = Depends(get_session),
):
    stmt = select(ChamCong).where(ChamCong.ma_nhan_vien == ma_nhan_vien).order_by(ChamCong.ngay.desc())
    result = await session.execute(stmt)
    return [serialize_cc(cc) for cc in result.scalars().all()]


@router.get("/stats/{ma_nhan_vien}", response_description="Get attendance statistics")
async def get_attendance_stats(
    ma_nhan_vien: str,
    session: AsyncSession = Depends(get_session),
):
    """Tính thống kê chấm công: tổng giờ làm việc, số ngày làm việc trong tháng hiện tại"""
    today = datetime.now().date()
    first_day_of_month = date(today.year, today.month, 1)
    
    stmt = select(ChamCong).where(
        ChamCong.ma_nhan_vien == ma_nhan_vien,
        ChamCong.ngay >= first_day_of_month,
        ChamCong.ngay <= today,
    )
    result = await session.execute(stmt)
    records = result.scalars().all()
    
    total_hours = 0.0
    work_days = 0
    today_record = None
    
    def calc_hours_for_record(cc: ChamCong) -> float:
        """Tính tổng giờ làm việc từ các buổi sáng/chiều"""
        total = 0.0
        
        def _calc_hours(checkin_str: str | None, checkout_str: str | None) -> float:
            if not checkin_str or not checkout_str:
                return 0.0
            try:
                checkin_time = datetime.strptime(checkin_str, "%H:%M:%S").time()
                checkout_time = datetime.strptime(checkout_str, "%H:%M:%S").time()
                checkin_dt = datetime.combine(cc.ngay, checkin_time)
                checkout_dt = datetime.combine(cc.ngay, checkout_time)
                if checkout_dt < checkin_dt:
                    checkout_dt += timedelta(days=1)
                diff = checkout_dt - checkin_dt
                return diff.total_seconds() / 3600.0
            except (ValueError, AttributeError):
                return 0.0
        
        # Cộng giờ làm việc của từng buổi
        total += _calc_hours(getattr(cc, "checkin_sang", None), getattr(cc, "checkout_sang", None))
        total += _calc_hours(getattr(cc, "checkin_chieu", None), getattr(cc, "checkout_chieu", None))
        return total
    
    for cc in records:
        hours = calc_hours_for_record(cc)
        if hours > 0:
            total_hours += hours
            work_days += 1
        
        if cc.ngay == today:
            today_record = serialize_cc(cc)
    
    # Lấy thông tin nhân viên để lấy lương cơ bản
    nv = await session.get(NhanVien, ma_nhan_vien)
    luong_co_ban = "0"
    if nv and nv.muc_luong_co_ban:
        luong_co_ban = str(nv.muc_luong_co_ban)
    
    return {
        "ma_nhan_vien": ma_nhan_vien,
        "tong_gio_lam": round(total_hours, 2),
        "so_ngay_lam_viec": work_days,
        "hom_nay": today_record,
        "luong_co_ban": luong_co_ban,
    }


@router.get("/today/{ma_nhan_vien}", response_description="Get today's attendance")
async def get_today_attendance(
    ma_nhan_vien: str,
    session: AsyncSession = Depends(get_session),
):
    """Lấy bản ghi chấm công hôm nay của nhân viên"""
    today = datetime.now().date()
    stmt = select(ChamCong).where(
        ChamCong.ma_nhan_vien == ma_nhan_vien,
        ChamCong.ngay == today,
    )
    record = await session.scalar(stmt)
    if record:
        return serialize_cc(record)
    return None
