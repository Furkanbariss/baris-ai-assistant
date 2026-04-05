from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(title="Barış AI Assistant API")

# CORS Ayarı: İleride yazacağımız Next.js Frontend'inin 
# bu backend'e istek atabilmesi için kapıları açıyoruz.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotaları uygulamaya dahil et
app.include_router(router)

# Sunucunun çalışıp çalışmadığını test etmek için basit bir karşılama
@app.get("/")
def read_root():
    return {"message": "🚀 Barış AI Asistanı Sunucusu Aktif!"}