import { Puzzle } from '../types/chess';

export const PUZZLES_DB: Puzzle[] = [
  {
    id: 'puz_1',
    titleAr: 'مات الصف الأخير (Back Rank Mate)',
    titleEn: 'Back Rank Checkmate',
    rating: 900,
    theme: 'Checkmate',
    fen: '6k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1',
    turn: 'w',
    moves: ['e2e8'],
    solutionExplanationAr: 'الوزير يتحرك إلى e8 معلناً كش مات حاسم لأن بيادق الأسود تحاصر ملكه في الصف الأخير دون مخرج.',
    solutionExplanationEn: 'The Queen delivers checkmate on e8 because Black pawns trap the king on the back rank.'
  },
  {
    id: 'puz_2',
    titleAr: 'شوكة الحصان الملكية (Royal Fork)',
    titleEn: 'Royal Knight Fork',
    rating: 1100,
    theme: 'Fork',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
    turn: 'w',
    moves: ['c4f7', 'e8f7'],
    solutionExplanationAr: 'تضحية الفيل في f7 مع كش لخلخلة دفاع الملك الأسود وحرمانه من التبييت.',
    solutionExplanationEn: 'Bishop sacrifice on f7 draws the black king out and prevents castling.'
  },
  {
    id: 'puz_3',
    titleAr: 'مات الخنق الأسطوري (Smothered Mate)',
    titleEn: 'Classic Smothered Mate',
    rating: 1450,
    theme: 'Smothered Mate',
    fen: '6k1/5ppp/8/8/8/5N2/1Q6/6K1 w - - 0 1',
    turn: 'w',
    moves: ['b2b8'],
    solutionExplanationAr: 'الوزير يخترق الصف الخلفي محققاً الكش مات المباشر.',
    solutionExplanationEn: 'The Queen infiltrates the 8th rank to deliver instantaneous checkmate.'
  },
  {
    id: 'puz_4',
    titleAr: 'تكتيك السيخ وربط الوزير (Skewer)',
    titleEn: 'Queen Skewer',
    rating: 1300,
    theme: 'Skewer',
    fen: '4k3/8/8/8/8/1b6/4Q3/4K3 b - - 0 1',
    turn: 'b',
    moves: ['b3e6'],
    solutionExplanationAr: 'إغلاق الكش بالفيل مع تثبيت الموقف والدفاع الممتاز.',
    solutionExplanationEn: 'Blocking the check safely with the bishop to defend the position.'
  },
  {
    id: 'puz_5',
    titleAr: 'كش مات في نقلتين (Mate in 2)',
    titleEn: 'Two-Move Checkmate Sequence',
    fen: 'r1b2rk1/pp3ppp/2n5/8/2B5/5Q2/P4PPP/4R1K1 w - - 0 1',
    turn: 'w',
    rating: 1550,
    theme: 'Attacking King',
    moves: ['f3f7', 'f8f7', 'e1e8'],
    solutionExplanationAr: 'تضحية الوزير في f7! بعد أخذ الرخ f8xf7، يدخل رخ الأبيض e1-e8# كش مات الصف الأخير!',
    solutionExplanationEn: 'Queen sacrifice on f7! After Black takes with the rook, White plays Re8# for a back-rank mate!'
  },
  {
    id: 'puz_6',
    titleAr: 'شوكة بيدق مزدوجة (Pawn Fork)',
    titleEn: 'Pawn Fork Tactic',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1bB1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 4 5',
    turn: 'w',
    rating: 1200,
    theme: 'Double Attack',
    moves: ['c3d5'],
    solutionExplanationAr: 'قفزة الحصان إلى d5 تضغط بقوة على فيل الأسود وحصانه وتسيطر على المربعات الحيوية.',
    solutionExplanationEn: 'Knight to d5 exerts heavy central pressure on Black’s bishop and knight.'
  },
  {
    id: 'puz_7',
    titleAr: 'تضحية الفيل اليونانية (Greek Gift)',
    titleEn: 'Greek Gift Sacrifice',
    fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQ1RK1 w - - 0 7',
    turn: 'w',
    rating: 1650,
    theme: 'Sacrifice',
    moves: ['c1g5'],
    solutionExplanationAr: 'ربط الحصان في f6 تمهيداً لهجوم كاسح على جناح الملك.',
    solutionExplanationEn: 'Pinning the f6 knight setting up a decisive kingside onslaught.'
  }
];
