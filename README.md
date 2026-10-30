# ♞ شطرنج المحترفين | Pro Chess Master
> لعبة شطرنج احترافية متكاملة 100% تعمل على متصفحات الويب، الهواتف الذكية، وتطبيق **Pocket Developer** بدون أي سيرفر أو متطلبات تشغيل معقدة.

---

## 📱 التشغيل داخل تطبيق Pocket Developer (Mobile & Desktop)

تطبيق Pocket Developer يعمل بملفات Client-side (HTML + CSS + JavaScript).
تم تصميم اللعبة لتعمل بكل كفاءة بإحدى الطريقتين:

### الطريقة الأولى: نسخة ملف HTML الفردي (Single File)
1. من داخل واجهة اللعبة، اضغط على زر **"تصدير لـ Pocket Developer"** ثم اضغط **"تحميل ملف HTML مفرد"** (أو انسخ الكود).
2. افتح تطبيق **Pocket Developer** على هاتفك.
3. أنشئ ملفاً جديداً باسم `index.html` والصق المحتوى به.
4. اضغط على زر **تشغيل / Preview**.
5. ستعمل اللعبة فوراً بجميع القطع والأصوات والذكاء الاصطناعي والألغاز، وحتى الأونلاين عبر WebRTC P2P!

### الطريقة الثانية: حزمة المشروع الكاملة (ZIP)
1. اضغط على زر **"تحميل حزمة المشروع ZIP"**.
2. فك الضغط داخل مجلد مشاريع Pocket Developer وشغل `index.html`.

---

## 🌐 اللعب أونلاين: الخيارات المتاحة

### 1) اللعب المباشر بدون خادم (WebRTC / PeerJS) - مُفعّل افتراضياً
- لا يتطلب أي تسجيل أو خادم.
- يقوم اللاعب الأول بالضغط على **"إنشاء غرفة"** ومشاركة كود الغرفة المكون من 6 رموز أو رابط الدعوة مع صديقه.
- يقوم اللاعب الثاني بكتابة كود الغرفة والضغط على **"انضمام"**.
- يتم الاتصال مباشرة بين الجهازين بتقنية Peer-to-Peer مع مزامنة كاملة للوقت والحركات والدردشة.

### 2) اللعب عبر Firebase (Realtime / Firestore)
إذا رغبت في ربط اللعبة بحسابات حقيقية وسيرفر سحابي مجاني:

#### خطوات إعداد Firebase خطوة بخطوة:
1. ادخل على وحدة تحكم فايربيس: [https://console.firebase.google.com](https://console.firebase.google.com)
2. اضغط على **"Add project"** وسمّ المشروع (مثلاً: `chess-game`).
3. بعد إنشاء المشروع، من القائمة الجانبية اختر **Build** > **Firestore Database**.
4. اضغط على **Create database** واختر أقرب خادم لك (مثلاً `europe-west3`).
5. ادخل على تبويب **Rules** (قواعد الأمان) والصق القواعد التالية ثم اضغط **Publish**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /rooms/{roomId} {
      allow read: if true;
      allow create: if true;
      allow update: if true;
      allow delete: if request.auth != null;
    }
    match /rooms/{roomId}/messages/{messageId} {
      allow read: if true;
      allow create: if request.resource.data.text.size() > 0 && request.resource.data.text.size() < 300;
    }
  }
}
```

6. اذهب إلى **Project Settings** (أيقونة الترس ⚙️) > **General** > **Your apps**.
7. اضغط على أيقونة الويب (`</>`) وسجل تطبيقاً باسم `ProChess`.
8. انسخ كائن `firebaseConfig` وضعه في ملف `src/services/firebaseConfig.ts`.

---

## 🎮 الميزات المدمجة في اللعبة

1. **قواعد الشطرنج الرسمية 100%:**
   - التبييت بكلا الجناحين (King & Queen side Castling).
   - الأخذ بالمرور (En Passant).
   - ترقية البيادق (Pawn Promotion) باختيار القطعة (وزير، رخ، فيل، حصان).
   - الكش والكش مات والتعادل بالخنقة (Stalemate).
   - كشف التعادل التلقائي: تكرار الموقف 3 مرات، قاعدة الـ 50 نقلة، وعدم كفاية القطع.

2. **الذكاء الاصطناعي واللعب ضد الكمبيوتر:**
   - 5 مستويات متفاوتة من مبتدئ إلى أستاذ كبير (Minimax مع Alpha-Beta pruning و Piece-Square Tables).
   - شريط تقييم الموقف لحظياً (Evaluation Bar).
   - تلميحات ذكية لأفضل نقلة (Best Move Hint).
   - كشف وتسمية الافتتاحيات الشهيرة باللغتين العربية والإنجليزية.

3. **ألغاز وتكتيكات شطرنج:**
   - بنك ألغاز متنوع (كش مات في نقلة، كش مات في نقلتين، شوكة الحصان، مات الصف الأخير، تضحيات الفيل).
   - شرح مفصل لكل لغز بالعربية والإنجليزية.

4. **الأوضاع الخاصة (Chess Variants):**
   - شطرنج 960 (Chess960 / Fischer Random) بتوزيع عشوائي سليم قانونياً.
   - ملك التل (King of the Hill) للسيطرة على مربعات المركز.
   - ثلاث كشات (Three-Check) لتحقيق الفوز السريع.

5. **ساعة الشطرنج المتزامنة:**
   - Bullet (1+0, 2+1), Blitz (3+0, 3+2, 5+0, 5+3), Rapid (10+0, 15+10), Classical.
   - نظام الـ Increment المضاف لكل نقلة.

6. **أصوات وتأثيرات واقعية:**
   - مركب صوتي إلكتروني (Web Audio API Synthesizer) لا يحتاج أي ملفات صوتية خارجية ولا يفشل بدون إنترنت.

7. **تعدد الثيمات واللغات:**
   - ثيمات رقعة متعددة (الزمرد الأخضر، خشب كلاسيكي، أزرق، داكن).
   - دعم كامل للغة العربية (RTL) واللغة الإنجليزية (LTR) مع تبديل فوري.
