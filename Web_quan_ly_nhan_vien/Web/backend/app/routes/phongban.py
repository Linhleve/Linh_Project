from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.db_models import PhongBan
from app.models import PhongBanSchema, UpdatePhongBanSchema

router = APIRouter()

@router.get("/", response_description="Phong ban retrieved")
async def get_phongbans(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(PhongBan))
    return [
        {
            "ma_phong": pb.ma_phong,
            "ten_phong": pb.ten_phong,
            "nam_thanh_lap": pb.nam_thanh_lap,
            "trang_thai": pb.trang_thai,
        }
        for pb in result.scalars().all()
    ]

@router.post("/", response_description="Phong ban data added into the database")
async def add_phongban(
    phongban: PhongBanSchema = Body(...),
    session: AsyncSession = Depends(get_session),
):
    data = jsonable_encoder(phongban)
    entity = PhongBan(**data)
    session.add(entity)
    await session.commit()
    await session.refresh(entity)
    return data

@router.put("/{id}")
async def update_phongban(
    id: str,
    req: UpdatePhongBanSchema = Body(...),
    session: AsyncSession = Depends(get_session),
):
    req = {k: v for k, v in req.dict().items() if v is not None}
    
    update_data = {}
    if "ma_phong_ban_moi" in req:
        raise HTTPException(status_code=400, detail="Không hỗ trợ đổi mã phòng")
    if "ten_phong_ban_moi" in req:
        update_data["ten_phong"] = req["ten_phong_ban_moi"]
    if "nam_thanh_lap_moi" in req:
        update_data["nam_thanh_lap"] = req["nam_thanh_lap_moi"]
    if "trang_thai_moi" in req:
        update_data["trang_thai"] = req["trang_thai_moi"]

    if update_data:
        stmt = (
            update(PhongBan)
            .where(PhongBan.ma_phong == id)
            .values(**update_data)
            .execution_options(synchronize_session="fetch")
        )
        result = await session.execute(stmt)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Phong ban not found")
        await session.commit()
        return {"message": "Phong ban updated successfully"}
    raise HTTPException(status_code=400, detail="No data to update")

@router.delete("/{id}", response_description="Phong ban data deleted from the database")
async def delete_phongban(id: str, session: AsyncSession = Depends(get_session)):
    entity = await session.get(PhongBan, id)
    if not entity:
        raise HTTPException(status_code=404, detail="Phong ban not found")
    await session.delete(entity)
    await session.commit()
    return {"message": "Phong ban deleted successfully"}
