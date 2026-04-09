# Barış AI Assistant

Barış AI Assistant, modern bir yapay zeka destekli asistan uygulamasıdır. Proje, hem backend (Python) hem de frontend (Next.js/React) bileşenlerinden oluşur ve modüler, geliştirilebilir bir mimari sunar.

## Genel Mimarinin Özeti

- **Backend:** Python tabanlı, REST API ve RAG (Retrieval-Augmented Generation) motoru içerir.
- **Frontend:** Next.js tabanlı modern web arayüzü.

## Klasör Yapısı

```
backend/   # API, veri işleme, servisler, RAG motoru
frontend/  # Web arayüzü (Next.js)
```

## Hızlı Başlangıç

### Gereksinimler
- Python 3.10+
- Node.js 18+
- npm veya yarn

### Kurulum

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
```

### Çalıştırma

#### Backend
```bash
cd backend
source venv/bin/activate
python -m app.main
```

#### Frontend
```bash
cd frontend
npm run dev
```

## Model Başarı Oranı

- Son ölçümde model başarı yüzdesi: **%72.7**

Not: Test için 'gpt-4o' modeli kullanılmıştır. Başarı yüzdesi kullanılan modele göre değişmektedir.

## Katkı Sağlama

Katkıda bulunmak için lütfen ilgili backend veya frontend klasörlerindeki README dosyalarını inceleyin.

## Lisans

Bu proje açık kaynaklıdır. Lisans detayları için LICENSE dosyasına bakınız.

## İletişim

Her türlü soru ve öneri için lütfen proje yöneticisine ulaşın.

---

## Detaylı Dokümantasyon

- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)
