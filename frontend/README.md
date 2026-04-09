
# Frontend (Next.js) - Barış AI Assistant

Bu klasör, Barış AI Assistant projesinin Next.js tabanlı frontend bileşenini içerir. Modern ve kullanıcı dostu bir web arayüzü sunar.

## İçerik
- [Kurulum](#kurulum)
- [Çalıştırma](#çalıştırma)
- [Yapılandırma](#yapılandırma)
- [Klasör Yapısı](#klasör-yapısı)
- [Önemli Dosyalar](#önemli-dosyalar)
- [Test ve Geliştirme](#test-ve-geliştirme)
- [Sıkça Sorulan Sorular](#sıkça-sorulan-sorular)

## Kurulum

Gereksinimler:
- Node.js 18+
- npm veya yarn

```bash
cd frontend
npm install
```

## Çalıştırma

```bash
npm run dev
```

## Yapılandırma

- Ortam değişkenleri için `.env.local` dosyası kullanılabilir.
- API adresi ve diğer ayarlar `next.config.ts` veya ortam değişkenleriyle yönetilir.

## Klasör Yapısı

```
frontend/
	package.json
	next.config.ts
	app/
		layout.tsx      # Genel layout
		page.tsx        # Ana sayfa
		admin/          # Admin paneli
	public/
		images/         # Statik görseller
	...
```

## Önemli Dosyalar
- `app/page.tsx`: Ana sayfa
- `app/admin/`: Admin paneli ve giriş
- `globals.css`: Genel stiller
- `next.config.ts`: Next.js yapılandırması

## Test ve Geliştirme

- Kod kalitesi için ESLint ve TypeScript kullanılır.
- Geliştirme sırasında otomatik yeniden yükleme desteklenir.

## Sıkça Sorulan Sorular

- Soru: API adresini nereden değiştiririm?
	- Cevap: `.env.local` veya `next.config.ts` dosyasından.
- Soru: Hangi komutla başlatılır?
	- Cevap: `npm run dev`

---

Backend için [Backend README](../backend/README.md) dosyasına bakınız.
