import sqlite3
from pathlib import Path

# Veritabanı dosyamızın konumu (data klasörünün içi)
DB_PATH = Path(__file__).resolve().parent.parent / "data" / "chat_history.db"

# 1. Tabloyu Oluştur (Eğer yoksa)
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tablo yoksa oluştur
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chats (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT,
            ref_code TEXT,
            user_message TEXT,
            bot_response TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # ref_code kolon yoksa ekle (eski veritabanları için)
    try:
        cursor.execute('ALTER TABLE chats ADD COLUMN ref_code TEXT DEFAULT "organik"')
    except sqlite3.OperationalError:
        # Kolon zaten varsa, hata yok saydığımız bir exception
        pass
    
    conn.commit()
    conn.close()

# 2. Yeni Gelen Mesajı ve Cevabı Kaydet
def save_chat(session_id, user_message, bot_response, ref_code="organik"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO chats (session_id, ref_code, user_message, bot_response)
        VALUES (?, ?, ?, ?)
    ''', (session_id, ref_code, user_message, bot_response))
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

# 4. Tüm Session'ları Getir (Admin Panel için)
def get_all_sessions():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT 
            session_id,
            ref_code,
            COUNT(*) as message_count,
            MAX(user_message) as last_query,
            MAX(timestamp) as last_timestamp
        FROM chats
        GROUP BY session_id, ref_code
        ORDER BY last_timestamp DESC
    ''')
    rows = cursor.fetchall()
    conn.close()
    
    sessions = []
    for row in rows:
        sessions.append({
            "session_id": row[0],
            "ref_code": row[1],
            "message_count": row[2],
            "last_query": row[3],
            "timestamp": row[4]
        })
    
    return sessions

# 5. Belirli Bir Session'ın Detaylarını Getir
def get_session_details(session_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT user_message, bot_response, timestamp FROM chats
        WHERE session_id = ?
        ORDER BY timestamp ASC
    ''', (session_id,))
    rows = cursor.fetchall()
    conn.close()
    
    messages = []
    for row in rows:
        messages.append({
            "user_message": row[0],
            "bot_response": row[1],
            "timestamp": row[2]
        })
    
    return messages