import uuid
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_session
from app.db_models import User
from app.models import UserRegisterSchema, UserLoginSchema

router = APIRouter()

@router.post("/register", response_description="Register new user")
async def register(
    user: UserRegisterSchema = Body(...),
    session: AsyncSession = Depends(get_session),
):
    user_data = jsonable_encoder(user)

    existing = await session.scalar(select(User).where(User.username == user_data["username"]))
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    new_user = User(
        id=str(uuid.uuid4()),
        username=user_data["username"],
        password=user_data["password"],
        ho_ten=user_data["ho_ten"],
        ma_nhan_vien=user_data.get("ma_nhan_vien"),
    )
    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return {
        "id": new_user.id,
        "username": new_user.username,
        "ho_ten": new_user.ho_ten,
    }

@router.post("/login", response_description="Login user")
async def login(
    user: UserLoginSchema = Body(...),
    session: AsyncSession = Depends(get_session),
):
    user_data = jsonable_encoder(user)

    stmt = select(User).where(
        User.username == user_data["username"],
        User.password == user_data["password"],
    )
    existing_user = await session.scalar(stmt)

    if existing_user:
        role = "admin" if existing_user.username == "admin" else "user"
        return {
            "message": "Login successful",
            "user": {
                "id": existing_user.id,
                "username": existing_user.username,
                "ho_ten": existing_user.ho_ten,
                "ma_nhan_vien": existing_user.ma_nhan_vien or None,
            },
            "role": role,
        }

    raise HTTPException(status_code=401, detail="Invalid credentials")
