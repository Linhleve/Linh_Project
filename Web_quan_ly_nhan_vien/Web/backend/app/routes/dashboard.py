from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.db_models import ChamCong, ChucVu, NhanVien, PhongBan

router = APIRouter()


@router.get("/stats", response_description="Get dashboard stats")
async def get_stats(session: AsyncSession = Depends(get_session)):
    nv_count = await session.scalar(select(func.count()).select_from(NhanVien)) or 0
    pb_count = await session.scalar(select(func.count()).select_from(PhongBan)) or 0
    cv_count = await session.scalar(select(func.count()).select_from(ChucVu)) or 0

    today = datetime.now().date()
    cc_stmt = select(func.count()).select_from(ChamCong).where(ChamCong.ngay == today)
    cc_count = await session.scalar(cc_stmt) or 0

    return {
        "nhan_vien_count": nv_count,
        "cham_cong_today": cc_count,
        "phong_ban_count": pb_count,
        "chuc_vu_count": cv_count,
    }


@router.get("/chucvu-distribution", response_description="Get employee distribution by position")
async def get_chucvu_distribution(session: AsyncSession = Depends(get_session)):
    """Lấy thống kê số nhân viên theo từng chức vụ"""
    stmt = (
        select(ChucVu.ten_chuc_vu, func.count(NhanVien.ma_nhan_vien).label("count"))
        .outerjoin(NhanVien, ChucVu.ma_chuc_vu == NhanVien.ma_chuc_vu)
        .group_by(ChucVu.ma_chuc_vu, ChucVu.ten_chuc_vu)
        .order_by(ChucVu.ten_chuc_vu)
    )
    result = await session.execute(stmt)
    rows = result.all()
    
    return {
        "labels": [row.ten_chuc_vu for row in rows],
        "data": [row.count or 0 for row in rows]
    }


@router.get("/phongban-distribution", response_description="Get employee distribution by department")
async def get_phongban_distribution(session: AsyncSession = Depends(get_session)):
    """Lấy thống kê số nhân viên theo từng phòng ban"""
    stmt = (
        select(PhongBan.ten_phong, func.count(NhanVien.ma_nhan_vien).label("count"))
        .outerjoin(NhanVien, PhongBan.ma_phong == NhanVien.ma_phong)
        .group_by(PhongBan.ma_phong, PhongBan.ten_phong)
        .order_by(PhongBan.ten_phong)
    )
    result = await session.execute(stmt)
    rows = result.all()
    
    return {
        "labels": [row.ten_phong for row in rows],
        "data": [row.count or 0 for row in rows]
    }
