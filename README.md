Pintasan ssift + alt + F : Rapihkan format file 

kalau baru buka buka terminal (cd.telsa.super.app, kemudian npm install, kemudian npm run dev)

cek eror halaman di Buka browser TSA → Ctrl+Shift+I

// Kode warna logo BPDP
const colors = {
  orange: "#EF8523", // Oranye
  red: "#B5302D",    // Merah
};

Set up abru buka file
1. cd telsa.super.app (opsional tergantung di folder mana )
2. npm install
3. npm run dev


update git hub
git status 
git add .
git commit -m "Memperbaiki UI/UX user experience telsa V2.0 FINAL 1"
git push origin main

Jika menggunakan server maka "npm run dev"
Jika menggunakan lokal maka "npm run dev:local"

jika BE mau akses punya FE maka "FE di terminal harus" = npm run dev -- --host



4. git remote add origin https://github.com/telsasuperapp-team/TSA-Team.git
5. git branch -M main
6. git push -u origin main

git update-index --assume-unchanged src/Pages/Masuk.jsx

lalu mengembalikan masuk.jsx ke update lagi di git hub : 
git update-index --no-assume-unchanged src/Pages/Masuk.jsx


Fungsi setiap file :
1. Routes : Mengatur alur halaman / navigasi yang mana
2. Layout : Mengatur/menentukan tampilannya bagaimana dan struktur UI