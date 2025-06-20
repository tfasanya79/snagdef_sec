from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from backend.models.database import SessionLocal, User
from backend.utils.security import (
    hash_password, 
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    oauth2_scheme,
    get_current_user,
    get_current_admin_user
)
from backend.models.schemas import Token, UserCreate, RefreshTokenRequest

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}}
)

@router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    """Register a new user"""
    db = SessionLocal()
    try:
        if db.query(User).filter(User.username == user_data.username).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user = User(
            username=user_data.username,
            hashed_password=hash_password(user_data.password),
            role="user"  # Default role
        )
        db.add(user)
        db.commit()

        return {
            "access_token": create_access_token(data={"sub": user.username}),
            "refresh_token": create_refresh_token(data={"sub": user.username}),
            "token_type": "bearer"
        }
    finally:
        db.close()

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticate user and return tokens"""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == form_data.username).first()
        
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return {
            "access_token": create_access_token(data={"sub": user.username}),
            "refresh_token": create_refresh_token(data={"sub": user.username}),
            "token_type": "bearer"
        }
    finally:
        db.close()

@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest):
    """Generate new tokens using refresh token"""
    payload = verify_refresh_token(request.refresh_token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == payload["sub"]).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {
            "access_token": create_access_token(data={"sub": user.username}),
            "refresh_token": create_refresh_token(data={"sub": user.username}),
            "token_type": "bearer"
        }
    finally:
        db.close()

@router.get("/admin-only")
async def admin_route(user: User = Depends(get_current_admin_user)):
    """Example admin-only endpoint"""
    return {
        "message": f"Admin access granted to {user.username}",
        "user_role": user.role
    }