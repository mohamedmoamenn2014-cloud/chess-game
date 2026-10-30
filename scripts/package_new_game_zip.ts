import fs from 'node:fs';
import path from 'node:path';
import JSZip from 'jszip';
import { generateStandaloneSingleHtml } from '../src/services/singleFileGenerator';

async function buildZip() {
  const zip = new JSZip();

  // 1. Root standalone version for instant 1-click play without node
  const standaloneHtml = generateStandaloneSingleHtml();
  zip.file('index.html', standaloneHtml);
  zip.file('standalone_offline_chess.html', standaloneHtml);

  // 2. Comprehensive Arabic & English README
  zip.file('README.md', `# شطرنج المحترفين ثلاثي الأبعاد | Pro Chess Master 3D (النسخة الكاملة)

هذا هو الأرشيف الرسمي للعبة الشطرنج الجديدة التي تم تطويرها. يحتوي هذا الملف على خيارين للتشغيل:

---

## 🎯 الخيار 1: التشغيل الفوري بدون خادم (Offline / Standalone)
- فقط قم بالنقر المزدوج على ملف \`index.html\` أو \`standalone_offline_chess.html\` ليفتح في أي متصفح (Chrome, Safari, Edge, Firefox) أو تطبيق Pocket Developer على الهواتف والأجهزة الذكية.
- اللعبة تحتوي على:
  - محرك الذكاء الاصطناعي (سهل / متوسط / صعب / خبير)
  - اللعب الجماعي أونلاين عبر WebRTC P2P
  - ألغاز تكتيكية وأدوار تدريبية
  - ساعة الشطرنج الرسمية
  - تصميم عصري وسريع ومستقل تماماً!

---

## 💻 الخيار 2: تشغيل المشروع الكامل (React + Vite + Three.js 3D)
إذا أردت التعديل على الكود أو تشغيل بيئة التطوير الكاملة ثلاثية الأبعاد:
1. تأكد من تثبيت Node.js (الإصدار 18 أو أحدث).
2. افتح مجلد المشروع في سطر الأوامر (Terminal):
   \`\`\`bash
   npm install
   npm run dev
   \`\`\`
3. افتح الرابط المعروض \`http://localhost:3000\` في متصفحك للاستمتاع برقعة الشطرنج ثلاثية الأبعاد (3D Board Studio) والتحليلات المتقدمة.

---
تم التطوير والإنشاء بنجاح! ♟️
`);

  // 3. Add project source files for developers
  const filesToInclude = [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'metadata.json'
  ];

  for (const f of filesToInclude) {
    if (fs.existsSync(f)) {
      zip.file(f, fs.readFileSync(f, 'utf-8'));
    }
  }

  // Helper to recursively add directory
  function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
        const subFolder = zipFolder.folder(entry.name);
        if (subFolder) addDirectoryToZip(fullPath, subFolder);
      } else {
        if (entry.name.endsWith('.zip')) continue;
        zipFolder.file(entry.name, fs.readFileSync(fullPath));
      }
    }
  }

  const srcFolder = zip.folder('src');
  if (srcFolder) {
    addDirectoryToZip('src', srcFolder);
  }

  const publicFolder = zip.folder('public');
  if (publicFolder) {
    addDirectoryToZip('public', publicFolder);
  }

  // Generate buffer and save to public/pro-chess-master.zip
  const content = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 }
  });

  fs.writeFileSync('public/pro-chess-master.zip', content);
  console.log(`Generated public/pro-chess-master.zip (${(content.length / 1024).toFixed(1)} KB)`);
}

buildZip().catch(console.error);
