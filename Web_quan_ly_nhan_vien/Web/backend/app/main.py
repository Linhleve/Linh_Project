from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db import init_db
from app.routes import (
    auth,
    chamcong,
    chucvu,
    dashboard,
    luong,
    nhanvien,
    phongban,
    taikhoan,
)

# Khởi tạo FastAPI app
app = FastAPI(
    title="Backend API",
    description="FastAPI Backend Base",
    version="1.0.0",
    debug=settings.DEBUG
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup hook
@app.on_event("startup")
async def on_startup():
    await init_db()


# Include routers expected by the frontend
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(taikhoan.router, prefix="/api/taikhoan", tags=["TaiKhoan"])
app.include_router(nhanvien.router, prefix="/api/nhanvien", tags=["NhanVien"])
app.include_router(phongban.router, prefix="/api/phongban", tags=["PhongBan"])
app.include_router(chucvu.router, prefix="/api/chucvu", tags=["ChucVu"])
app.include_router(chamcong.router, prefix="/api/chamcong", tags=["ChamCong"])
app.include_router(luong.router, prefix="/api/luongnhanvien", tags=["Luong"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to FastAPI Backend!",
        "version": "1.0.0",
        "docs": "/docs"
    }

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )
