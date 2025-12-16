from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.db_models import ChucVu
from app.models import ChucVuSchema, UpdateChucVuSchema

router = APIRouter()

@router.get("/", response_description="Chuc vu retrieved")
async def get_chucvus(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(ChucVu))
    return [
        {
            "ma_chuc_vu": cv.ma_chuc_vu,
            "ten_chuc_vu": cv.ten_chuc_vu,
        }
        for cv in result.scalars().all()
    ]

@router.post("/", response_description="Chuc vu data added into the database")
async def add_chucvu(
    chucvu: ChucVuSchema = Body(...),
    session: AsyncSession = Depends(get_session),
):
    data = jsonable_encoder(chucvu)
    entity = ChucVu(**data)
    session.add(entity)
    await session.commit()
    return data

@router.put("/{id}")
async def update_chucvu(
    id: str,
    req: UpdateChucVuSchema = Body(...),
    session: AsyncSession = Depends(get_session),
):
    req = {k: v for k, v in req.dict().items() if v is not None}
    
    update_data = {}
    if "ma_chuc_vu_moi" in req:
        raise HTTPException(status_code=400, detail="Không hỗ trợ đổi mã chức vụ")
    if "ten_chuc_vu_moi" in req:
        update_data["ten_chuc_vu"] = req["ten_chuc_vu_moi"]

    if update_data:
        stmt = (
            update(ChucVu)
            .where(ChucVu.ma_chuc_vu == id)
            .values(**update_data)
            .execution_options(synchronize_session="fetch")
        )
        result = await session.execute(stmt)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Chuc vu not found")
        await session.commit()
        return {"message": "Chuc vu updated successfully"}
    raise HTTPException(status_code=400, detail="No data to update")

@router.delete("/{id}", response_description="Chuc vu data deleted from the database")
async def delete_chucvu(id: str, session: AsyncSession = Depends(get_session)):
    entity = await session.get(ChucVu, id)
    if not entity:
        raise HTTPException(status_code=404, detail="Chuc vu not found")
    await session.delete(entity)
    await session.commit()
    return {"message": "Chuc vu deleted successfully"}
