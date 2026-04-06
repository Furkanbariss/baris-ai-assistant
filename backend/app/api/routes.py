from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.rag_engine import ask_bot
from app.services.db_logger import init_db, save_chat, get_history

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
    "guest": "Misafir Kullanıcı"
}

# Frontend'den gelecek verinin taslağı (session_id eklendi)
class ChatRequest(BaseModel):
    question: str
    ref_code: str
    session_id: str = "test_kullanicisi" # Hangi tarayıcıdan/kişiden geldiği

@router.post("/chat")
def chat_endpoint(request: ChatRequest):
    if request.ref_code not in VALID_REF_CODES:
        raise HTTPException(status_code=401, detail="Geçersiz referans kodu!")
    
    try:
        # 1. Bu kullanıcının eski konuşmalarını veritabanından çek
        history = get_history(request.session_id)
        
        # 2. Soruyu ve geçmişi bota ilet
        answer = ask_bot(request.question, history)
        
        # 3. Yeni soruyu ve cevabı veritabanına kaydet
        save_chat(request.session_id, request.question, answer)
        
        return {
            "answer": answer,
            "company": VALID_REF_CODES[request.ref_code],
            "session_id": request.session_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))