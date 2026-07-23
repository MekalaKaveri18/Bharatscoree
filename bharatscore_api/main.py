# bharatscore_api/main.py
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, get_engine
from . import models  # ✅ ensure models load before table creation

# Routers
from .routers.auth import router as auth_router
from .routers.borrower import router as borrower_router
from .routers.docs import router as docs_router
from .routers.scoring import router as scoring_router
from .routers.lender import router as lender_router
from .routers.admin import router as admin_router

# ---------------------------------------------------------
# FASTAPI INIT
# ---------------------------------------------------------
app = FastAPI(
    title="BharatScore API",
    version="1.0.0",
    description="Core backend for BharatScore platform"
)

# ---------------------------------------------------------
# CORS CONFIGURATION
# ---------------------------------------------------------
origins = [
    "http://localhost:8081",   # Vite / React dev server
    "http://127.0.0.1:8081",
    "http://localhost:3000",   # (optional) for React default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],      # GET, POST, PATCH, DELETE, etc.
    allow_headers=["*"],      # Include Authorization, Content-Type, etc.
)

# ---------------------------------------------------------
# DATABASE INITIALIZATION
# ---------------------------------------------------------
engine = get_engine()
Base.metadata.create_all(bind=engine)

# ---------------------------------------------------------
# ROUTERS REGISTRATION (API v1)
# ---------------------------------------------------------
app.include_router(auth_router, prefix="/api/v1")
app.include_router(borrower_router, prefix="/api/v1")
app.include_router(docs_router, prefix="/api/v1")
app.include_router(scoring_router, prefix="/api/v1")
app.include_router(lender_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")

# ---------------------------------------------------------
# ROOT ENDPOINT
# ---------------------------------------------------------
@app.get("/")
def root():
    return {"status": "ok", "service": "bharatscore"}
