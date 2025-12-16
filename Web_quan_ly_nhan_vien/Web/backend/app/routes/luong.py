import uuid
from datetime import datetime, date
from decimal import Decimal
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, Field

from app.db import get_session
from app.db_models import Luong, ChamCong, NhanVien

router = APIRouter()


class LuongSchema(BaseModel):
    ma_nhan_vien: str = Field(...)
    thang_nam: str = Field(...)
    tong_gio_lam: str = Field(...)
    gio_tang_ca: str = Field(...)
    luong_co_ban: str = Field(...)
    luong_tang_ca: str = Field(...)
    luong_thuc_nhan: str = Field(...)
    ngay_tinh: str = Field(...)


class AutoCalcLuongRequest(BaseModel):
    ma_nhan_vien: str = Field(...)
    year: int = Field(...)
    month: int = Field(...)

@router.get("/", response_description="Luong nhan vien retrieved")
async def get_luong(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Luong))
    luongs = result.scalars().all()
    return [
        {
            "id": lg.id,
            "ma_nhan_vien": lg.ma_nhan_vien,
            "thang_nam": lg.thang_nam,
            "tong_gio_lam": str(lg.tong_gio_lam),
            "gio_tang_ca": str(lg.gio_tang_ca),
            "luong_co_ban": str(lg.luong_co_ban),
            "luong_tang_ca": str(lg.luong_tang_ca),
            "luong_thuc_nhan": str(lg.luong_thuc_nhan),
            "ngay_tinh": lg.ngay_tinh.isoformat(),
        }
        for lg in luongs
    ]


@router.post("/", response_description="Luong data added")
async def add_luong(
    luong: LuongSchema = Body(...),
    session: AsyncSession = Depends(get_session),
):
    data = jsonable_encoder(luong)

    # Chuyển sang Decimal để xử lý nghiệp vụ
    tong_gio_lam = Decimal(data["tong_gio_lam"])
    gio_tang_ca = Decimal(data["gio_tang_ca"])
    luong_co_ban = Decimal(data["luong_co_ban"])
    luong_tang_ca = Decimal(data["luong_tang_ca"])
    luong_thuc_nhan = Decimal(data["luong_thuc_nhan"])

    # RULE: Chỉ những người làm đủ 40 giờ trở lên mới được nhận lương cứng (lương cơ bản)
    # Nếu < 40 giờ thì lương cơ bản = 0, lương thực nhận = chỉ còn lương tăng ca
    if tong_gio_lam < Decimal("40"):
        luong_co_ban = Decimal("0")
        # giữ lại tiền tăng ca nếu có
        luong_thuc_nhan = luong_tang_ca
    entity = Luong(
        id=str(uuid.uuid4()),
        ma_nhan_vien=data["ma_nhan_vien"],
        thang_nam=data["thang_nam"],
        tong_gio_lam=tong_gio_lam,
        gio_tang_ca=gio_tang_ca,
        luong_co_ban=luong_co_ban,
        luong_tang_ca=luong_tang_ca,
        luong_thuc_nhan=luong_thuc_nhan,
        ngay_tinh=datetime.strptime(data["ngay_tinh"], "%Y-%m-%d").date(),
    )
    session.add(entity)
    await session.commit()
    await session.refresh(entity)
    return {
        "id": entity.id,
        "ma_nhan_vien": entity.ma_nhan_vien,
        "thang_nam": entity.thang_nam,
        "tong_gio_lam": str(entity.tong_gio_lam),
        "gio_tang_ca": str(entity.gio_tang_ca),
        "luong_co_ban": str(entity.luong_co_ban),
        "luong_tang_ca": str(entity.luong_tang_ca),
        "luong_thuc_nhan": str(entity.luong_thuc_nhan),
        "ngay_tinh": entity.ngay_tinh.isoformat(),
    }


@router.post("/auto-calc", response_description="Tự động tính lương theo tháng dựa trên giờ làm")
async def auto_calc_luong(
    payload: AutoCalcLuongRequest = Body(...),
    session: AsyncSession = Depends(get_session),
):
    """
    Tính lương tháng cho 1 nhân viên dựa trên dữ liệu chấm công:
    - Nếu tổng giờ < 40  => không được lương cơ bản, lương = 0
    - Nếu tổng giờ = 40  => lương = lương cơ bản
    - Nếu tổng giờ > 40  => lương = lương cơ bản + (giờ làm thêm * lương giờ * 1.5)
    """
    ma_nhan_vien = payload.ma_nhan_vien
    year = payload.year
    month = payload.month

    nv = await session.get(NhanVien, ma_nhan_vien)
    if not nv:
        raise HTTPException(status_code=404, detail="Nhân viên không tồn tại")
    if not nv.muc_luong_co_ban:
        raise HTTPException(status_code=400, detail="Nhân viên chưa có mức lương cơ bản")

    luong_co_ban_thang = Decimal(str(nv.muc_luong_co_ban))
    base_hours = Decimal("40")
    hourly_rate = luong_co_ban_thang / base_hours

    # Khoảng thời gian trong tháng
    first_day = date(year, month, 1)
    if month == 12:
        last_day = date(year + 1, 1, 1)
    else:
        last_day = date(year, month + 1, 1)

    # Lấy tất cả bản ghi chấm công trong tháng
    stmt = select(ChamCong).where(
        ChamCong.ma_nhan_vien == ma_nhan_vien,
        ChamCong.ngay >= first_day,
        ChamCong.ngay < last_day,
    )
    result = await session.execute(stmt)
    records = result.scalars().all()

    # Hàm tính giờ 1 buổi
    def calc_hours_for_record(cc: ChamCong) -> Decimal:
        from datetime import timedelta as _td, datetime as _dt

        def _calc(checkin_str, checkout_str) -> Decimal:
            if not checkin_str or not checkout_str:
                return Decimal("0")
            try:
                checkin_time = _dt.strptime(checkin_str, "%H:%M:%S").time()
                checkout_time = _dt.strptime(checkout_str, "%H:%M:%S").time()
                checkin_dt = _dt.combine(cc.ngay, checkin_time)
                checkout_dt = _dt.combine(cc.ngay, checkout_time)
                if checkout_dt < checkin_dt:
                    checkout_dt += _td(days=1)
                diff = checkout_dt - checkin_dt
                hours = Decimal(str(diff.total_seconds() / 3600.0))
                return hours
            except Exception:
                return Decimal("0")

        total = Decimal("0")
        total += _calc(getattr(cc, "checkin_sang", None), getattr(cc, "checkout_sang", None))
        total += _calc(getattr(cc, "checkin_chieu", None), getattr(cc, "checkout_chieu", None))
        return total

    tong_gio = sum((calc_hours_for_record(cc) for cc in records), Decimal("0"))

    if tong_gio < base_hours:
        gio_tang_ca = Decimal("0")
        luong_co_ban = Decimal("0")
        luong_tang_ca = Decimal("0")
        luong_thuc_nhan = Decimal("0")
    elif tong_gio == base_hours:
        gio_tang_ca = Decimal("0")
        luong_co_ban = luong_co_ban_thang
        luong_tang_ca = Decimal("0")
        luong_thuc_nhan = luong_co_ban
    else:
        gio_tang_ca = tong_gio - base_hours
        luong_co_ban = luong_co_ban_thang
        luong_tang_ca = gio_tang_ca * hourly_rate * Decimal("1.5")
        luong_thuc_nhan = luong_co_ban + luong_tang_ca

    thang_nam = f"{year:04d}-{month:02d}"

    # Kiểm tra đã có bản ghi lương tháng này chưa
    existing_stmt = select(Luong).where(
        Luong.ma_nhan_vien == ma_nhan_vien,
        Luong.thang_nam == thang_nam,
    )
    existing_res = await session.execute(existing_stmt)
    existing = existing_res.scalar_one_or_none()

    if existing:
        existing.tong_gio_lam = tong_gio
        existing.gio_tang_ca = gio_tang_ca
        existing.luong_co_ban = luong_co_ban
        existing.luong_tang_ca = luong_tang_ca
        existing.luong_thuc_nhan = luong_thuc_nhan
        existing.ngay_tinh = datetime.now().date()
        entity = existing
    else:
        entity = Luong(
            id=str(uuid.uuid4()),
            ma_nhan_vien=ma_nhan_vien,
            thang_nam=thang_nam,
            tong_gio_lam=tong_gio,
            gio_tang_ca=gio_tang_ca,
            luong_co_ban=luong_co_ban,
            luong_tang_ca=luong_tang_ca,
            luong_thuc_nhan=luong_thuc_nhan,
            ngay_tinh=datetime.now().date(),
        )
        session.add(entity)

    await session.commit()
    await session.refresh(entity)

    return {
        "id": entity.id,
        "ma_nhan_vien": entity.ma_nhan_vien,
        "thang_nam": entity.thang_nam,
        "tong_gio_lam": str(entity.tong_gio_lam),
        "gio_tang_ca": str(entity.gio_tang_ca),
        "luong_co_ban": str(entity.luong_co_ban),
        "luong_tang_ca": str(entity.luong_tang_ca),
        "luong_thuc_nhan": str(entity.luong_thuc_nhan),
        "ngay_tinh": entity.ngay_tinh.isoformat(),
    }


@router.get("/my-salary/{ma_nhan_vien}", response_description="Get salary by employee")
async def get_my_salary(
    ma_nhan_vien: str,
    session: AsyncSession = Depends(get_session),
):
    """Lấy tất cả lương của nhân viên"""
    stmt = select(Luong).where(Luong.ma_nhan_vien == ma_nhan_vien).order_by(Luong.thang_nam.desc())
    result = await session.execute(stmt)
    luongs = result.scalars().all()
    return [
        {
            "id": lg.id,
            "ma_nhan_vien": lg.ma_nhan_vien,
            "thang_nam": lg.thang_nam,
            "tong_gio_lam": str(lg.tong_gio_lam),
            "gio_tang_ca": str(lg.gio_tang_ca),
            "luong_co_ban": str(lg.luong_co_ban),
            "luong_tang_ca": str(lg.luong_tang_ca),
            "luong_thuc_nhan": str(lg.luong_thuc_nhan),
            "ngay_tinh": lg.ngay_tinh.isoformat(),
        }
        for lg in luongs
    ]


@router.get("/my-salary/{ma_nhan_vien}/{year}", response_description="Get salary by employee and year")
async def get_my_salary_by_year(
    ma_nhan_vien: str,
    year: int,
    session: AsyncSession = Depends(get_session),
):
    """Lấy lương của nhân viên theo năm"""
    year_str = str(year)
    stmt = select(Luong).where(
        Luong.ma_nhan_vien == ma_nhan_vien,
        Luong.thang_nam.like(f"{year_str}-%")
    ).order_by(Luong.thang_nam.asc())
    result = await session.execute(stmt)
    luongs = result.scalars().all()
    
    # Tính tổng
    tong_thu_nhap = sum(float(lg.luong_thuc_nhan) for lg in luongs)
    tong_gio_lam = sum(float(lg.tong_gio_lam) for lg in luongs)
    tong_gio_tang_ca = sum(float(lg.gio_tang_ca) for lg in luongs)
    
    return {
        "ma_nhan_vien": ma_nhan_vien,
        "nam": year,
        "tong_thu_nhap": str(tong_thu_nhap),
        "tong_gio_lam": str(tong_gio_lam),
        "tong_gio_tang_ca": str(tong_gio_tang_ca),
        "chi_tiet": [
            {
                "id": lg.id,
                "thang_nam": lg.thang_nam,
                "tong_gio_lam": str(lg.tong_gio_lam),
                "gio_tang_ca": str(lg.gio_tang_ca),
                "luong_co_ban": str(lg.luong_co_ban),
                "luong_tang_ca": str(lg.luong_tang_ca),
                "luong_thuc_nhan": str(lg.luong_thuc_nhan),
            }
            for lg in luongs
        ]
    }
