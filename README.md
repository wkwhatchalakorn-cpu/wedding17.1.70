# Wedding e-card · Sirinporn & Whatchalakorn

การ์ดเชิญแต่งงานออนไลน์ (ซองจดหมายเปิดได้, นับถอยหลัง, โปรแกรมงาน, ปฏิทิน, RSVP, คำอวยพร, เพลงพื้นหลัง)
เป็นเว็บ static ล้วน (HTML/CSS/JS) ไม่ต้อง build เก็บคำตอบลง Google Sheets ผ่าน Google Apps Script

## โครงสร้าง
```
index.html
css/style.css
js/config.js     <- ใส่ URL ของ Apps Script ที่นี่
js/backend.js    <- ส่ง/ดึงข้อมูลจาก Apps Script
js/main.js       <- ฟอร์ม RSVP, นับถอยหลัง, แสดงคำอวยพร
js/music.js      <- เพลงพื้นหลัง (เริ่มเมื่อแขกแตะ/คลิก)
js/intro.js      <- ซองจดหมาย, ปุ่มปฏิทิน (.ics / Google Calendar)
assets/img, assets/audio
backend/apps-script.gs
```

## 1) ขึ้น GitHub Pages
1. สร้าง repo ใหม่ แล้ว push ทุกไฟล์ในโฟลเดอร์นี้
2. Settings → Pages → Source: *Deploy from a branch* → `main` / `(root)`
3. ได้ลิงก์ `https://<user>.github.io/<repo>/` ส่งให้แขกได้เลย (แขกไม่ต้อง login)

## 2) ตั้งค่าที่เก็บคำตอบ (Google Sheets)
1. สร้าง Google Sheet ใหม่ → Extensions → Apps Script
2. วางโค้ดจาก `backend/apps-script.gs` → Save
3. Deploy → New deployment → Web app → Execute as: **Me**, Who has access: **Anyone** → Deploy (อนุญาตสิทธิ์)
4. คัดลอก URL ที่ลงท้าย `/exec` ไปใส่ใน `js/config.js` → `rsvpEndpoint`
5. commit/push อีกครั้ง คำตอบจะเข้าชีต `RSVP` แถวละหนึ่งคน (แขกตอบซ้ำจะอัปเดตแถวเดิม)
   - อยากซ่อนคำอวยพรบางข้อความ: พิมพ์ `TRUE` ในคอลัมน์ `hide`
   - ยอดผู้ตอบ/จำนวนแขก ใช้สูตรในชีต เช่น `=COUNTIF(E:E,"yes")`, `=SUMIF(E:E,"yes",F:F)`
   - แก้โค้ด Apps Script แล้วต้อง Deploy → Manage deployments → New version

## 3) สิ่งที่ควรแก้/ตรวจสอบ
- `js/intro.js`: เวลาจบงานในปฏิทิน (ตั้งไว้ 21:00 โดยประมาณ)
- `js/main.js`: `CONFIG.venue` ปุ่มแผนที่ค้นหาจากชื่อสถานที่ — ถ้ามีลิงก์ Google Maps จริงให้ใส่แทน
- `assets/audio/music.mp3`: ใช้เฉพาะเพลงที่คุณมีสิทธิ์ใช้เผยแพร่สาธารณะ (royalty-free) เพราะหน้าเว็บเปิดให้คนทั่วไปฟัง
- ฟอนต์โหลดจาก Google Fonts (Bodoni Moda, IBM Plex Sans Thai)
- ถ้ายังไม่ตั้ง `rsvpEndpoint` การ์ดจะเปิดได้ แต่กดส่งคำตอบไม่ได้ (จะแจ้งข้อผิดพลาด)

ทดสอบในเครื่อง: `python3 -m http.server` แล้วเปิด http://localhost:8000
