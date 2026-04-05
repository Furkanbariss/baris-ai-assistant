# Bu yöntem dosyanın nerede olduğundan bağımsız olarak .env'i bulur
import os
from pathlib import Path
from dotenv import load_dotenv
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

# 1. API anahtarını backend/ altındaki .env dosyasından çek
# ingest.py'nin bulunduğu yerden 2 klasör yukarı çık (backend ana klasörü)
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

def run_ingestion():
    # 2. Dosya yolları (ingest.py data/ klasörü içinde olduğu için direkt erişim)
    file_path = "cv.md"
    persist_dir = "chroma_db"
    
    if not os.path.exists(file_path):
        print(f"Hata: {file_path} bulunamadı!")
        return
    
    #CV dosyamı Türkçe karakterlere dikkat ederek güvenle aç, içeriğini bir yazı olarak hafızaya al ve işin bitince dosyayı hemen kapat
    with open(file_path, "r", encoding="utf-8") as f:
        markdown_content = f.read()

    # 3. Markdown Hiyerarşisini Tanımla (H1 - H4 arası)
    cv_headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
        ("####", "Header 4"),
    ]
    
    md_splitter = MarkdownHeaderTextSplitter(headers_to_split_on=cv_headers_to_split_on)
    md_header_splits = md_splitter.split_text(markdown_content)

    # 4. İkincil Parçalama (Recursive Splitting)
    # Eğer bir bölüm çok detaysa, anlamlı alt parçalara böler
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=600, # 600 karakterden fazla olanları atmışar öne ve arkaya pay vererekten bölüyoruz
        chunk_overlap=60
    )
    all_splits = text_splitter.split_documents(md_header_splits)

    # 5. Vektörleştirme ve Kayıt 
    print(f"Toplam {len(all_splits)} anlamlı parça oluşturuldu. Vektörleştiriliyor...")
    
    # OpenAI Embedding modelini kullanarak ChromaDB'ye kaydet
    vectorstore = Chroma.from_documents(
        documents=all_splits,
        embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
        persist_directory=persist_dir
    )
    
    print(f"Başarılı! Veritabanı '{persist_dir}' klasörüne kaydedildi.")

if __name__ == "__main__":
    run_ingestion()