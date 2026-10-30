export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    appTitle: 'شطرنج المحترفين',
    appSubtitle: 'منصة شطرنج كاملة ومتكاملة للهواتف والكمبيوتر و Pocket Developer',
    play: 'لعب',
    modes: {
      passAndPlay: 'لاعبان (نفس الجهاز)',
      vsComputer: 'ضد الكمبيوتر (AI)',
      onlineP2P: 'أونلاين مباشر (PeerJS)',
      onlineFirebase: 'أونلاين (Firebase)',
      puzzles: 'ألغاز وتكتيكات',
      analysis: 'لوحة التحليل والتقييم',
      variants: 'أوضاع خاصة (Variants)'
    },
    difficulties: {
      beginner: 'مبتدئ (تقييم 800)',
      easy: 'سهل (تقييم 1200)',
      medium: 'متوسط (تقييم 1600)',
      hard: 'متقدم (تقييم 2000)',
      master: 'أستاذ كبير (تقييم 2400+)'
    },
    variants: {
      standard: 'الشطرنج الكلاسيكي',
      chess960: 'شطرنج 960 (فيشر العشوائي)',
      king_of_the_hill: 'ملك التل (King of the Hill)',
      three_check: 'ثلاث كشات (Three-Check)'
    },
    variantDescriptions: {
      standard: 'القواعد الرسمية العالمية مع التبييت والأخذ بالمرور والترقية',
      chess960: 'ترتيب عشوائي للقطع على الصف الأول والثامن لاختبار الإبداع',
      king_of_the_hill: 'أول من يوصل ملكه إلى أحد المربعات الأربعة المركزية يفوز',
      three_check: 'أول لاعب يوجه 3 كشات لملك الخصم يفوز فوراً'
    },
    timeControls: {
      bullet: 'بوليت (سريع جداً)',
      blitz: 'بليتز (خاطف)',
      rapid: 'رابيد (سريع)',
      classical: 'كلاسيكي',
      unlimited: 'بدون وقت'
    },
    gameStatus: {
      whiteTurn: 'دور الأبيض للعب',
      blackTurn: 'دور الأسود للعب',
      checkWhite: 'كش ملك على الأبيض!',
      checkBlack: 'كش ملك على الأسود!',
      checkmateWhiteWon: 'كش مات! الأبيض يفوز بالضربة القاضية 🏆',
      checkmateBlackWon: 'كش مات! الأسود يفوز بالضربة القاضية 🏆',
      stalemate: 'تعادل بالخنقة (Stalemate)!',
      drawRepetition: 'تعادل بتكرار الموقف 3 مرات',
      draw50Moves: 'تعادل بقاعدة الـ 50 نقلة دون أخذ أو حركة بيدق',
      drawMaterial: 'تعادل لعدم كفاية القطع للإماتة',
      drawAgreed: 'تم الاتفاق على التعادل',
      whiteTimeout: 'انتهى وقت الأبيض! الأسود يفوز ⏱️',
      blackTimeout: 'انتهى وقت الأسود! الأبيض يفوز ⏱️',
      whiteResigned: 'استسلم الأبيض. الأسود يفوز',
      blackResigned: 'استسلم الأسود. الأبيض يفوز',
      kothWon: 'فاز بإيصال الملك إلى مركز الرقعة!',
      threeCheckWon: 'فاز بإعطاء 3 كشات لملك الخصم!'
    },
    actions: {
      newGame: 'مباراة جديدة',
      resign: 'استسلام',
      offerDraw: 'عرض تعادل',
      takeback: 'تراجع عن نقلة',
      flipBoard: 'تدوير الرقعة',
      settings: 'الإعدادات',
      exportPocketDev: 'تصدير لـ Pocket Developer',
      exportPGN: 'نسخ PGN',
      copyFEN: 'نسخ FEN',
      importFEN: 'استيراد FEN',
      hint: 'اقتراح حركة (تلميح)',
      soundOn: 'تشغيل الصوت',
      soundOff: 'كتم الصوت',
      restart: 'إعادة البدء',
      shareRoom: 'مشاركة كود الغرفة',
      joinRoom: 'الانضمام لغرفة',
      createRoom: 'إنشاء غرفة جديدة',
      chat: 'الدردشة',
      send: 'إرسال',
      close: 'إغلاق',
      nextPuzzle: 'اللغز التالي',
      retryPuzzle: 'إعادة المحاولة',
      showSolution: 'عرض الحل',
      copyCode: 'نسخ الكود',
      downloadHtml: 'تحميل ملف HTML مفرد',
      downloadZip: 'تحميل حزمة المشروع ZIP'
    },
    analysis: {
      title: 'تحليل المحرك الذكي',
      eval: 'التقييم:',
      bestMove: 'أفضل نقلة مقترحة:',
      accuracy: 'الدقة العامة:',
      opening: 'الافتتاحية الحالية:',
      grades: {
        brilliant: 'نقلة خارقة !!',
        best: 'أفضل نقلة !',
        good: 'نقلة جيدة',
        inaccuracy: 'غير دقيقة ؟!',
        mistake: 'خطأ ؟',
        blunder: 'خطأ فادح ؟؟',
        book: 'نقلة افتتاحية'
      }
    },
    online: {
      p2pTitle: 'لعب أونلاين عبر WebRTC (بدون خادم)',
      p2pDesc: 'اتصال مباشر بينك وبين صديقك بواسطة كود الغرفة أو رابط الدعوة، بدون الحاجة لأي سيرفر.',
      yourRoomCode: 'كود غرفتك:',
      enterRoomCode: 'أدخل كود الغرفة للانضمام:',
      connecting: 'جارٍ الاتصال بالشبكة...',
      connected: 'متصل مع اللاعب الآخر!',
      waitingForOpponent: 'في انتظار انضمام الخصم...',
      opponentLeft: 'غادر الخصم المباراة أو انقطع الاتصال.',
      drawOffered: 'الخصم يعرض التعادل، هل توافق؟',
      acceptDraw: 'قبول التعادل',
      rejectDraw: 'رفض',
      takebackRequested: 'الخصم يطلب التراجع عن حركته الأخيرة، هل توافق؟',
      acceptTakeback: 'موافقة',
      rejectTakeback: 'رفض',
      firebaseTitle: 'لعب أونلاين عبر Firebase',
      firebaseInstructions: 'كيفية تشغيل Firebase مجاناً خلال دقيقتين'
    },
    pocketDev: {
      title: 'تشغيل اللعبة داخل Pocket Developer',
      subtitle: 'كيف تنقل اللعبة بالكامل إلى تطبيق Pocket Developer على هاتفك أو حاسوبك',
      instructions: [
        'اضغط على زر "تحميل ملف HTML مفرد" أو زر "نسخ كود HTML".',
        'افتح تطبيق Pocket Developer على هاتفك المحمول.',
        'أنشئ ملفاً جديداً باسم index.html وألصق الكود بالكامل.',
        'اضغط زر التشغيل (Run / Preview) وستعمل اللعبة فوراً بدون إنترنت مع الذكاء الاصطناعي والألغاز والأصوات، أو أونلاين بالـ WebRTC!'
      ],
      singleFileReady: 'نسخة الـ HTML المفردة جاهزة ومدمجة بها كافة الصور والأصوات والمحرك.',
      zipReady: 'حزمة الـ ZIP المنظمة جاهزة وتتضمن كل الملفات المنفصلة وملف README وقواعد Firebase.'
    },
    themes: {
      boardTheme: 'ثيم الرقعة',
      pieceTheme: 'شكل القطع',
      emerald: 'الزمرد الأخضر (بطولات)',
      wood: 'خشب كلاسيكي',
      blue: 'أزرق عصري',
      midnight: 'منتصف الليل الداكن',
      charcoal: 'الفحم الأنيق'
    }
  },
  en: {
    appTitle: 'Pro Chess Master',
    appSubtitle: 'Professional complete chess suite for Mobile, Desktop & Pocket Developer',
    play: 'Play',
    modes: {
      passAndPlay: 'Pass & Play (Same Device)',
      vsComputer: 'vs Computer (AI)',
      onlineP2P: 'Direct Online (PeerJS)',
      onlineFirebase: 'Online (Firebase)',
      puzzles: 'Tactical Puzzles',
      analysis: 'Analysis Board & Engine',
      variants: 'Chess Variants'
    },
    difficulties: {
      beginner: 'Beginner (~800)',
      easy: 'Easy (~1200)',
      medium: 'Medium (~1600)',
      hard: 'Advanced (~2000)',
      master: 'Grandmaster (2400+)'
    },
    variants: {
      standard: 'Standard Chess',
      chess960: 'Chess960 (Fischer Random)',
      king_of_the_hill: 'King of the Hill',
      three_check: 'Three-Check'
    },
    variantDescriptions: {
      standard: 'Official FIDE rules with castling, en passant, promotion',
      chess960: 'Randomized back rank pieces to test pure tactical instinct',
      king_of_the_hill: 'First player to bring their king to the center wins',
      three_check: 'First player to check the opponent king 3 times wins'
    },
    timeControls: {
      bullet: 'Bullet',
      blitz: 'Blitz',
      rapid: 'Rapid',
      classical: 'Classical',
      unlimited: 'Unlimited'
    },
    gameStatus: {
      whiteTurn: 'White to move',
      blackTurn: 'Black to move',
      checkWhite: 'White is in check!',
      checkBlack: 'Black is in check!',
      checkmateWhiteWon: 'Checkmate! White wins! 🏆',
      checkmateBlackWon: 'Checkmate! Black wins! 🏆',
      stalemate: 'Draw by stalemate!',
      drawRepetition: 'Draw by threefold repetition',
      draw50Moves: 'Draw by 50-move rule',
      drawMaterial: 'Draw by insufficient material',
      drawAgreed: 'Draw agreed by players',
      whiteTimeout: 'White ran out of time! Black wins ⏱️',
      blackTimeout: 'Black ran out of time! White wins ⏱️',
      whiteResigned: 'White resigned. Black wins',
      blackResigned: 'Black resigned. White wins',
      kothWon: 'Won by reaching the center of the hill!',
      threeCheckWon: 'Won by delivering 3 checks!'
    },
    actions: {
      newGame: 'New Game',
      resign: 'Resign',
      offerDraw: 'Offer Draw',
      takeback: 'Takeback',
      flipBoard: 'Flip Board',
      settings: 'Settings',
      exportPocketDev: 'Export to Pocket Dev',
      exportPGN: 'Copy PGN',
      copyFEN: 'Copy FEN',
      importFEN: 'Import FEN',
      hint: 'Best Move Hint',
      soundOn: 'Sound On',
      soundOff: 'Mute',
      restart: 'Restart',
      shareRoom: 'Share Room Code',
      joinRoom: 'Join Room',
      createRoom: 'Create New Room',
      chat: 'Chat',
      send: 'Send',
      close: 'Close',
      nextPuzzle: 'Next Puzzle',
      retryPuzzle: 'Retry',
      showSolution: 'Show Solution',
      copyCode: 'Copy Code',
      downloadHtml: 'Download Single HTML',
      downloadZip: 'Download ZIP Bundle'
    },
    analysis: {
      title: 'Smart Engine Analysis',
      eval: 'Evaluation:',
      bestMove: 'Suggested Best Move:',
      accuracy: 'Overall Accuracy:',
      opening: 'Current Opening:',
      grades: {
        brilliant: 'Brilliant !!',
        best: 'Best !',
        good: 'Good',
        inaccuracy: 'Inaccuracy ?!',
        mistake: 'Mistake ?',
        blunder: 'Blunder ??',
        book: 'Book move'
      }
    },
    online: {
      p2pTitle: 'Online WebRTC (Serverless P2P)',
      p2pDesc: 'Direct peer-to-peer connection between you and your friend via room code or invite link.',
      yourRoomCode: 'Your Room Code:',
      enterRoomCode: 'Enter Room Code:',
      connecting: 'Connecting to peer network...',
      connected: 'Connected with opponent!',
      waitingForOpponent: 'Waiting for opponent to join...',
      opponentLeft: 'Opponent disconnected or left.',
      drawOffered: 'Opponent offered a draw. Accept?',
      acceptDraw: 'Accept Draw',
      rejectDraw: 'Decline',
      takebackRequested: 'Opponent requested a takeback. Accept?',
      acceptTakeback: 'Accept',
      rejectTakeback: 'Decline',
      firebaseTitle: 'Online with Firebase',
      firebaseInstructions: 'Quick 2-minute free Firebase setup guide'
    },
    pocketDev: {
      title: 'Run in Pocket Developer',
      subtitle: 'How to run the full game inside Pocket Developer on mobile or desktop',
      instructions: [
        'Click "Download Single HTML" or "Copy HTML Code".',
        'Open the Pocket Developer app on your phone.',
        'Create a new file named index.html and paste the code.',
        'Hit Run/Preview to play immediately with AI, Puzzles, Offline Audio, and WebRTC Online!'
      ],
      singleFileReady: 'Single HTML bundle is 100% self-contained with all SVGs, sound synth, and engine.',
      zipReady: 'Organized ZIP archive with separate folders, README, and Firebase rules.'
    },
    themes: {
      boardTheme: 'Board Theme',
      pieceTheme: 'Piece Style',
      emerald: 'Emerald Green (Tourney)',
      wood: 'Classic Wood',
      blue: 'Modern Blue',
      midnight: 'Dark Midnight',
      charcoal: 'Sleek Charcoal'
    }
  }
};
