from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_engine import ask_bot
from app.services.db_logger import init_db, save_chat, get_history, get_all_sessions, get_session_details

router = APIRouter()

# Sunucu her başladığında veritabanının hazır olduğundan emin ol
init_db()

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

# Frontend'den gelecek verinin taslağı (session_id eklendi)
class ChatRequest(BaseModel):
    question: str
    ref_code: str
    session_id: str = "test_kullanicisi" # Hangi tarayıcıdan/kişiden geldiği

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
def get_sessions():
    """Tüm sohbet session'larını getir (Admin Panel için)"""
    try:
        sessions = get_all_sessions()
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions/{session_id}")
def get_session(session_id: str):
    """Belirli bir session'ın detaylarını getir (Admin Panel için)"""
    try:
        messages = get_session_details(session_id)
        return {"session_id": session_id, "messages": messages}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))