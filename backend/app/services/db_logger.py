import sqlite3
from pathlib import Path

# Veritabanı dosyamızın konumu (data klasörünün içi)
DB_PATH = Path(__file__).resolve().parent.parent / "data" / "chat_history.db"

# 1. Tabloyu Oluştur (Eğer yoksa)
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            user_message TEXT,
            bot_response TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# 2. Yeni Gelen Mesajı ve Cevabı Kaydet
def save_chat(session_id, user_message, bot_response):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO chats (session_id, user_message, bot_response)
        VALUES (?, ?, ?)
    ''', (session_id, user_message, bot_response))
    conn.commit()
    conn.close()

# 3. Eski Konuşmaları Geri Çağır (Asistanın Hafızası)
def get_history(session_id, limit=4):
    # Çok fazla eski mesaj botun kafasını karıştırabilir, son 4 sohbeti alıyoruz
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT user_message, bot_response FROM chats
        WHERE session_id = ?
        ORDER BY timestamp DESC
        LIMIT ?
    ''', (session_id, limit))
    rows = cursor.fetchall()
    conn.close()
    
    # Verileri botun okuyabileceği formata çevirip (eskiden yeniye) birleştir
    history_text = ""
    for row in reversed(rows):
        history_text += f"Mülakatçı: {row[0]}\nAsistan: {row[1]}\n\n"
    
    return history_text