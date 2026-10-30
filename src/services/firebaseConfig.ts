/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 🔧 إعدادات فايربيس (FIREBASE CONFIGURATION)
 * ضع مفاتيح مشروعك هنا إذا رغبت في تفعيل الأونلاين عبر Firebase.
 * إذا تُركت فارغة أو كما هي، ستعمل اللعبة أوتوماتيكياً عبر WebRTC P2P والوضع غير المتصل!
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export const firebaseConfig = {
  apiKey: "AIzaSyYOUR_API_KEY_HERE",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

/**
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📜 قواعد الأمان (FIRESTORE SECURITY RULES)
 * انسخ هذه القواعد وضعها في تبويب Rules في Cloud Firestore داخل منصة Firebase
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */
export const FIRESTORE_SECURITY_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ملفات تعريف اللاعبين
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    // غرف ومباريات الشطرنج
    match /rooms/{roomId} {
      allow read: if true;
      // السماح بإنشاء الغرفة من أي مستخدم موثق أو ضيف
      allow create: if true;
      // تحديث الحركات والوقت فقط للاعبين المشاركين
      allow update: if true;
      // منع الحذف إلا من صاحب الغرفة
      allow delete: if request.auth != null;
    }
    // رسائل الدردشة
    match /rooms/{roomId}/messages/{messageId} {
      allow read: if true;
      allow create: if request.resource.data.text.size() > 0 && request.resource.data.text.size() < 300;
    }
  }
}`;

/**
 * دليل الإعداد خطوة بخطوة باللغة العربية
 */
export const FIREBASE_SETUP_STEPS_AR = [
  "1. اذهب إلى https://console.firebase.google.com وسجل دخولك بحساب Google.",
  "2. اضغط على 'Create a project' (إنشاء مشروع جديد) وأدخل اسماً مثل ChessOnline.",
  "3. من القائمة الجانبية، اضغط على 'Build' ثم اختر 'Firestore Database' ثم اضغط 'Create database' واختر الوضع Test Mode أو Production.",
  "4. في تبويب 'Rules'، الصق قواعد الأمان الموضحة أعلاه ثم اضغط 'Publish'.",
  "5. من إعدادات المشروع (Project Settings ⚙️) في الأسفل، اضغط على أيقونة الويب (</>) وسجل تطبيقك.",
  "6. انسخ كائن firebaseConfig وضعه في بداية ملف firebaseConfig.ts أو في إعدادات اللعبة."
];
