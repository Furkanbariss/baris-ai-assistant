from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from pydantic import BaseModel
import os
import secrets
from datetime import datetime, timedelta
from app.services.rag_engine import ask_bot
from app.services.db_logger import init_db, save_chat, get_history, get_all_sessions, get_session_details

router = APIRouter()
security = HTTPBearer()

# Sunucu her başladığında veritabanının hazır olduğundan emin ol
init_db()

# Admin password - environment variable'dan oku
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# Token'ları depolama (production'da database kullan)
valid_tokens = set()

VALID_REF_CODES = {
    "devfur": "DevFurkan-Test Kullanıcısı",
    "aa": "Anadolu Ajansı İK Ekibi",
    "erkn": "ErkanMP",
    "linkedin": "Linkedin Ana Sayfası",
    "eyl": "Eylül",
    "zmr": "Zümer",
    "abm": "Abim",
    "co1": "company1",
    "co2": "company2",
    "co3": "company3",
    "ftf": "face to face",
    "neco": "Necati",
    "cv": "CV den gelen kullanıcı",
    "mail": "E-posta ile gelen kullanıcı",
    "organik": "link ile kullanıcı",
    "guest": "Misafir Kullanıcı"
}

# Request/Response Models
class LoginRequest(BaseModel):
    password: str

class LoginResponse(BaseModel):
    success: bool
    token: str = None
    message: str = None

# Frontend'den gelecek verinin taslağı (session_id eklendi)
class ChatRequest(BaseModel):
    question: str
    ref_code: str
    session_id: str = "test_kullanicisi" # Hangi tarayıcıdan/kişiden geldiği

# Helper function to generate a token
def generate_token():
    return secrets.token_urlsafe(32)

# Admin Login Endpoint
@router.post("/admin/login", response_model=LoginResponse)
def admin_login(request: LoginRequest):
    """Admin panele giriş yapan kullanıcıyı doğrula"""
    if request.password == ADMIN_PASSWORD:
        token = generate_token()
        valid_tokens.add(token)
        return LoginResponse(
            success=True,
            token=token,
            message="Başarıyla giriş yapıldı"
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz şifre"
        )

# Token validation function
def verify_admin_token(credentials = Depends(security)) -> str:
    """Admin token'ını doğrula"""
    token = credentials.credentials
    if token not in valid_tokens:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz veya süresi dolmuş token"
        )
    return token

@router.post("/chat")
def chat_endpoint(request: ChatRequest):
    # Ref code'u küçük harfe çevir
    normalized_ref_code = request.ref_code.lower()
    
    # Eğer geçersiz referans kodu ise, organik olarak kullan
    if normalized_ref_code not in VALID_REF_CODES:
        normalized_ref_code = "organik"
    
    try:
        # 1. Bu kullanıcının eski konuşmalarını veritabanından çek
        history = get_history(request.session_id)
        
        # 2. Soruyu ve geçmişi bota ilet
        answer = ask_bot(request.question, history)
        
        # 3. Yeni soruyu ve cevabı veritabanına kaydet
        save_chat(request.session_id, request.question, answer, normalized_ref_code)
        
        return {
            "answer": answer,
            "company": VALID_REF_CODES[normalized_ref_code],
            "session_id": request.session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
def get_sessions(token: str = Depends(verify_admin_token)):
    """Tüm sohbet session'larını getir (Admin Panel için)"""
    try:
        sessions = get_all_sessions()
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
def get_session(session_id: str, token: str = Depends(verify_admin_token)):
    """Belirli bir session'ın detaylarını getir (Admin Panel için)"""
    try:
        messages = get_session_details(session_id)
        return {"session_id": session_id, "messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))