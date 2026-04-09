# Backend (Python) - Barış AI Assistant

Bu klasör, Barış AI Assistant projesinin Python tabanlı backend bileşenini içerir. Backend, REST API, veri işleme, RAG (Retrieval-Augmented Generation) motoru ve servislerden oluşur.

## İçerik
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)
- [Yapılandırma](#yapılandırma)
- [Klasör Yapısı](#klasör-yapısı)
- [API ve Servisler](#api-ve-servisler)
- [Test ve Geliştirme](#test-ve-geliştirme)
- [Sıkça Sorulan Sorular](#sıkça-sorulan-sorular)

## Kurulum

Gereksinimler:
- Python 3.10+
- pip

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Çalıştırma

```bash
source venv/bin/activate
python -m app.main
```

## Yapılandırma

- Ortam değişkenleri ve yapılandırmalar için `.env` dosyası veya `config` modülleri kullanılabilir.
- Veritabanı dosyası: `app/data/chroma_db/chroma.sqlite3`

## Klasör Yapısı

```
backend/
  requirements.txt
  app/
    main.py           # Uygulama giriş noktası
    api/routes.py     # API endpointleri
    core/             # Temel yardımcılar ve altyapı
    data/             # Veri ve veri işleme scriptleri
    services/         # Servisler (ör. RAG motoru, logger)
    evaluation/       # Değerlendirme ve test scriptleri
```

## API ve Servisler

- API endpointleri: `app/api/routes.py`
- RAG motoru: `app/services/rag_engine.py`
- Logger servisi: `app/services/db_logger.py`

## Test ve Geliştirme

- Testler ve değerlendirme scriptleri: `app/evaluation/`
- Test verileri: `app/evaluation/*.csv`

## Sıkça Sorulan Sorular

- Soru: RAG motoru nasıl çalışır?
  - Cevap: `app/services/rag_engine.py` dosyasını inceleyin.
- Soru: Veritabanı nerede tutuluyor?
  - Cevap: `app/data/chroma_db/chroma.sqlite3` dosyasında.

---

Frontend için [Frontend README](../frontend/README.md) dosyasına bakınız.
