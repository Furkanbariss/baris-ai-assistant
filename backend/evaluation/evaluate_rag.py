import os
import sys
import ast
import warnings
import pandas as pd
from datasets import Dataset
from dotenv import load_dotenv

# 1. Kütüphane güncellemelerinden kaynaklı sinir bozucu terminal uyarılarını tamamen susturuyoruz!
warnings.filterwarnings("ignore")

# 2. RAGAS v0.2'nin istediği güncel ve temiz importlar
from ragas import evaluate
from ragas.metrics import Faithfulness, AnswerRelevancy, ContextPrecision, ContextRecall
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

# Kendi RAG motoruna erişim
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from app.services.rag_engine import ask_bot

load_dotenv()

# --- 1. SINAV KAĞIDINI YÜKLE ---
print("\nSınav kağıdı yükleniyor...")
df = pd.read_csv('evaluation/sentetik_test_verisi.csv')

# RAGAS'ın aradığı sütun isimlerini (eski veya yeni sürüm fark etmeksizin) otomatik bul
q_col = 'user_input' if 'user_input' in df.columns else 'question'
ref_col = 'reference' if 'reference' in df.columns else 'ground_truth'

ctx_col = 'contexts'
for col in ['contexts', 'reference_contexts', 'retrieved_contexts']:
    if col in df.columns:
        ctx_col = col
        break

eval_df = pd.DataFrame()
eval_df['user_input'] = df[q_col]
eval_df['reference'] = df[ref_col]

def parse_contexts(ctx):
    if isinstance(ctx, str):
        try:
            return ast.literal_eval(ctx)
        except Exception:
            return [ctx]
    return ctx

eval_df['retrieved_contexts'] = df[ctx_col].apply(parse_contexts)

# --- 2. ÖĞRENCİ SINAVDA ---
responses = []

print("Barış AI Asistanı soruları cevaplıyor. Lütfen bekleyin...")
for index, row in eval_df.iterrows():
    question = row['user_input']
    try:
        my_answer = ask_bot(question=question, history="")
        responses.append(my_answer)
        print(f"[{index + 1}/{len(eval_df)}] Cevaplandı.")
    except Exception as e:
        print(f"Hata oluştu (Soru: {question}): {e}")
        responses.append("Cevaplanamadı.")

eval_df['response'] = responses
dataset = Dataset.from_pandas(eval_df)

# --- 3. JÜRİ MASADA (Hata Buradaydı, Düzeltildi) ---
print("\nJüri (GPT-4o) cevapları okuyor ve karne hazırlıyor. Bu işlem 1-2 dakika sürebilir...")

# Jüri modellerini klasik Langchain ile tanımlıyoruz (En temizi bu)
judge_llm = ChatOpenAI(model="gpt-4o")
judge_embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# HATA ÇÖZÜMÜ: Metrikleri içine model gömmeden, sadece "nesne" () olarak başlatıyoruz.
metrics = [
    Faithfulness(),
    AnswerRelevancy(),
    ContextPrecision(),
    ContextRecall()
]

# Evaluate fonksiyonu modelleri alıp tüm metriklerin içine kendisi dağıtacak
result = evaluate(
    dataset=dataset,
    metrics=metrics,
    llm=judge_llm,          # Jürinin beyni
    embeddings=judge_embeddings # Jürinin arama motoru
)

# --- 4. KARNEYİ YAZDIR VE KAYDET ---
karne_df = result.to_pandas()
karne_df.to_csv('evaluation/asistan_karnesi.csv', index=False)

print("\n" + "="*50)
print("              SINAV SONUÇLARI (KARNE)")
print("="*50)
print(result)
print("\nDetaylı analiz 'evaluation/asistan_karnesi.csv' dosyasına kaydedildi.\n")