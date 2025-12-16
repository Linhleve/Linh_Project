import uuid
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import declarative_base

from app.config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG, future=True)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

Base = declarative_base()


async def get_session():
    async with AsyncSessionLocal() as session:
        yield session


async def init_db():
    import app.db_models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Migration nhẹ: thêm cột thu_tu_vao_cong_ty nếu chưa tồn tại
        await conn.execute(
            text(
                """
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'nhanvien'
                          AND column_name = 'thu_tu_vao_cong_ty'
                    ) THEN
                        ALTER TABLE nhanvien
                        ADD COLUMN thu_tu_vao_cong_ty INTEGER NULL;
                    END IF;
                END$$;
                """
            )
        )
        # Migration: thêm cột trang_thai nếu chưa tồn tại
        await conn.execute(
            text(
                """
                DO $$
                BEGIN
                    IF NOT EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'nhanvien'
                          AND column_name = 'trang_thai'
                    ) THEN
                        ALTER TABLE nhanvien
                        ADD COLUMN trang_thai VARCHAR(50) NOT NULL DEFAULT 'Hoạt động';
                        -- Cập nhật các giá trị NULL thành 'Hoạt động'
                        UPDATE nhanvien SET trang_thai = 'Hoạt động' WHERE trang_thai IS NULL;
                    END IF;
                END$$;
                """
            )
        )
    await seed_admin_user()
    await seed_default_chucvu()


async def seed_admin_user():
    from app.db_models import User

    async with AsyncSessionLocal() as session:
        existing = await session.scalar(select(User).where(User.username == "admin"))
        if existing:
            return
        admin = User(
            id=str(uuid.uuid4()),
            username="admin",
            password="123456",
            ho_ten="Administrator",
        )
        session.add(admin)
        await session.commit()


async def seed_default_chucvu():
    from app.db_models import ChucVu

    default_chucvus = [
        {"ma_chuc_vu": "TP", "ten_chuc_vu": "Trưởng phòng"},
        {"ma_chuc_vu": "PP", "ten_chuc_vu": "Phó phòng"},
        {"ma_chuc_vu": "NV", "ten_chuc_vu": "Nhân viên"},
    ]

    async with AsyncSessionLocal() as session:
        for cv_data in default_chucvus:
            existing = await session.scalar(
                select(ChucVu).where(ChucVu.ma_chuc_vu == cv_data["ma_chuc_vu"])
            )
            if not existing:
                chucvu = ChucVu(**cv_data)
                session.add(chucvu)
        await session.commit()

