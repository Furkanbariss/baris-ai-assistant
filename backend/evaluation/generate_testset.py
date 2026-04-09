import os
import pandas as pd
from langchain_community.document_loaders import DirectoryLoader
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from ragas.testset.generator import TestsetGenerator
from ragas.testset.evolutions import simple, reasoning, multi_context
from dotenv import load_dotenv

# .env dosyasındaki API anahtarını aktif et
load_dotenv() 

# 1. Dokümanları Yükleme
# Backend klasöründen çalıştırdığımızda app/data içindeki md dosyalarını bulur
loader = DirectoryLoader('./app/data', glob="**/*.md")
documents = loader.load()

if not documents:
    print("Hata: Klasörde okunacak doküman bulunamadı!")
    exit()

# 2. "Öğretmen" Modeli Ayarlama
# Soruları ve kusursuz cevapları (ground truth) bu model üretecek
generator_llm = ChatOpenAI(model="gpt-4o") 
generator_embeddings = OpenAIEmbeddings()

generator = TestsetGenerator.from_langchain(
    generator_llm,
    generator_llm,
    generator_embeddings
)

# 3. Soru Tiplerini ve Zorluk Dağılımını Belirleme
distributions = {
    simple: 0.5,        # %50: Net, tek cümlede bulunabilen doğrudan bilgi soruları
    reasoning: 0.25,    # %25: Metinden mantıksal çıkarım yapmayı gerektiren sorular
    multi_context: 0.25 # %25: İki farklı dosyadaki bilgiyi birleştirmeyi gerektiren zor sorular
}

# 4. Sınav Kağıdını Üretme
print("Barış AI Asistanı için test soruları üretiliyor. Bu işlem birkaç dakika sürebilir...")
testset = generator.generate_with_langchain_docs(
    documents,
    test_size=10, # Kaç adet soru üretmek istiyorsun? (Başlangıç için 10 idealdir)
    distributions=distributions
)

# 5. Sonucu Kaydetme
df = testset.to_pandas()

# İhtiyacımız olan ana sütunları filtreleyip CSV olarak kaydediyoruz
df_filtered = df[['question', 'contexts', 'ground_truth']]
df_filtered.to_csv('sentetik_test_verisi.csv', index=False)

print("Harika! Test verisi başarıyla 'sentetik_test_verisi.csv' olarak kaydedildi.")