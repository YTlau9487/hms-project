from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from datetime import datetime, timedelta
from jose import JWTError, jwt
from typing import Optional
from collections import defaultdict
import re

from database import get_session
from models import User, UserRole
from schemas import UserRegister, UserLogin, Token, UserResponse, UserUpdate

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Password validation: min 8 chars, at least one English letter, at least one digit
# Only allow ASCII letters (A-Z, a-z), digits (0-9), and common symbols
PASSWORD_REGEX = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=\[\]{};:\'",.<>?/\\|`~]{8,}$')

def validate_password(password: str) -> Optional[str]:
    """Validate password strength. Returns error message or None if valid."""
    if len(password) < 8:
        return "Password must be at least 8 characters long"
    # Check for spaces - spaces are not allowed
    if ' ' in password:
        return "Password must not contain spaces"
    # Check for non-ASCII characters (Chinese, Japanese, Korean, accented chars, etc.)
    if not all(ord(c) < 128 for c in password):
        return "Password must only contain English letters, digits, and symbols"
    # Check pattern: at least one letter, at least one digit, allowed chars only
    if not PASSWORD_REGEX.match(password):
        return "Password must contain at least one English letter and one digit"
    return None

# Rate limiting storage
login_attempts = defaultdict(list)
RATE_LIMIT_MAX_ATTEMPTS = 5
RATE_LIMIT_WINDOW = 900  # 15 minutes in seconds

# Password hasher
ph = PasswordHasher()

# JWT settings
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"

# Role-based token expiration times (in minutes)
TOKEN_EXPIRE_ADMIN = 10      # 10 minutes for admin
TOKEN_EXPIRE_STAFF = 30      # 30 minutes for staff
TOKEN_EXPIRE_CUSTOMER = 240  # 4 hours for customer


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    
    # Role-based token expiration
    role = data.get("role")
    if role == "admin":
        expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_ADMIN)
    elif role == "staff":
        expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_STAFF)
    else:  # customer or unknown role
        expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_CUSTOMER)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(
    request: Request,
    session: Session = Depends(get_session)
) -> User:
    """Dependency to get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Extract token from Authorization header
    authorization = request.headers.get("Authorization")
    if not authorization or not authorization.startswith("Bearer "):
        raise credentials_exception
    
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = session.exec(select(User).where(User.email == email)).first()
    if user is None:
        raise credentials_exception
    return user


def get_current_staff(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user is staff"""
    if current_user.role not in [UserRole.STAFF, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to ensure user is admin"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def check_rate_limit(client_ip: str) -> bool:
    """Check if client has exceeded rate limit"""
    now = datetime.utcnow()
    # Clean old attempts
    login_attempts[client_ip] = [
        t for t in login_attempts[client_ip]
        if (now - t).total_seconds() < RATE_LIMIT_WINDOW
    ]
    return len(login_attempts[client_ip]) < RATE_LIMIT_MAX_ATTEMPTS


def record_login_attempt(client_ip: str):
    """Record a login attempt"""
    login_attempts[client_ip].append(datetime.utcnow())


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, session: Session = Depends(get_session)):
    """Register a new user"""
    # Validate password strength
    password_error = validate_password(user_data.password)
    if password_error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=password_error
        )
    
    # Check if email already exists
    existing_user = session.exec(select(User).where(User.email == user_data.email)).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password with Argon2
    hashed_password = ph.hash(user_data.password)
    
    # Combine first and last name for backward compatibility
    full_name = f"{user_data.first_name} {user_data.last_name}".strip()
    
    # Create user
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        name=full_name,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone=user_data.phone,
        role=UserRole.CUSTOMER
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    return user


@router.post("/login", response_model=Token)
def login(
    request: Request,
    user_data: UserLogin,
    session: Session = Depends(get_session)
):
    """Login and get JWT token with rate limiting"""
    client_ip = request.client.host
    
    # Check rate limit
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again later."
        )
    
    # Find user by email
    user = session.exec(select(User).where(User.email == user_data.email)).first()
    if not user:
        record_login_attempt(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    try:
        ph.verify(user.hashed_password, user_data.password)
    except VerifyMismatchError:
        record_login_attempt(client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role.value}
    )
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update current user information"""
    # Update only provided fields
    if user_data.first_name is not None:
        current_user.first_name = user_data.first_name
    if user_data.last_name is not None:
        current_user.last_name = user_data.last_name
    # Update combined name for backward compatibility
    if user_data.first_name is not None or user_data.last_name is not None:
        fn = current_user.first_name or ""
        ln = current_user.last_name or ""
        current_user.name = f"{fn} {ln}".strip()
    if user_data.name is not None:
        current_user.name = user_data.name
    if user_data.phone is not None:
        # Normalize phone number to E.164 format (remove spaces)
        phone = user_data.phone.replace(' ', '') if user_data.phone else None
        current_user.phone = phone
    
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return current_user
