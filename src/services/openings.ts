import { OpeningInfo } from '../types/chess';

export const OPENINGS_DB: OpeningInfo[] = [
  {
    eco: 'B20',
    nameEn: 'Sicilian Defense',
    nameAr: 'الدفاع الصقلي',
    moves: 'e4 c5'
  },
  {
    eco: 'B90',
    nameEn: 'Sicilian Defense, Najdorf Variation',
    nameAr: 'الدفاع الصقلي - تفريع النايدورف',
    moves: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 a6'
  },
  {
    eco: 'B70',
    nameEn: 'Sicilian Defense, Dragon Variation',
    nameAr: 'الدفاع الصقلي - تفريع التنين',
    moves: 'e4 c5 Nf3 d6 d4 cxd4 Nxd4 Nf6 Nc3 g6'
  },
  {
    eco: 'C60',
    nameEn: 'Ruy Lopez (Spanish Opening)',
    nameAr: 'افتتاح روي لوبيز (الإسباني)',
    moves: 'e4 e5 Nf3 Nc6 Bb5'
  },
  {
    eco: 'C50',
    nameEn: 'Italian Game',
    nameAr: 'الافتتاح الإيطالي (Giuoco Piano)',
    moves: 'e4 e5 Nf3 Nc6 Bc4'
  },
  {
    eco: 'C55',
    nameEn: 'Two Knights Defense',
    nameAr: 'دفاع الحصانين',
    moves: 'e4 e5 Nf3 Nc6 Bc4 Nf6'
  },
  {
    eco: 'C42',
    nameEn: "Petrov's Defense",
    nameAr: 'دفاع بتروف (الروسي)',
    moves: 'e4 e5 Nf3 Nf6'
  },
  {
    eco: 'C30',
    nameEn: "King's Gambit",
    nameAr: 'غامبت الملك',
    moves: 'e4 e5 f4'
  },
  {
    eco: 'C00',
    nameEn: 'French Defense',
    nameAr: 'الدفاع الفرنسي',
    moves: 'e4 e6'
  },
  {
    eco: 'B10',
    nameEn: 'Caro-Kann Defense',
    nameAr: 'دفاع كارو-كان',
    moves: 'e4 c6'
  },
  {
    eco: 'B01',
    nameEn: 'Scandinavian Defense',
    nameAr: 'الدفاع الاسكندنافي',
    moves: 'e4 d5'
  },
  {
    eco: 'B07',
    nameEn: 'Pirc Defense',
    nameAr: 'دفاع بيرك',
    moves: 'e4 d6'
  },
  {
    eco: 'D06',
    nameEn: "Queen's Gambit",
    nameAr: 'غامبت الوزير',
    moves: 'd4 d5 c4'
  },
  {
    eco: 'D20',
    nameEn: "Queen's Gambit Accepted",
    nameAr: 'غامبت الوزير المقبول',
    moves: 'd4 d5 c4 dxc4'
  },
  {
    eco: 'D30',
    nameEn: "Queen's Gambit Declined",
    nameAr: 'غامبت الوزير المرفوض',
    moves: 'd4 d5 c4 e6'
  },
  {
    eco: 'D10',
    nameEn: 'Slav Defense',
    nameAr: 'الدفاع السلافي',
    moves: 'd4 d5 c4 c6'
  },
  {
    eco: 'E60',
    nameEn: "King's Indian Defense",
    nameAr: 'الدفاع الهندي للملك',
    moves: 'd4 Nf6 c4 g6'
  },
  {
    eco: 'E20',
    nameEn: 'Nimzo-Indian Defense',
    nameAr: 'دفاع النيمزو-هندي',
    moves: 'd4 Nf6 c4 e6 Nc3 Bb4'
  },
  {
    eco: 'A80',
    nameEn: 'Dutch Defense',
    nameAr: 'الدفاع الهولندي',
    moves: 'd4 f5'
  },
  {
    eco: 'A10',
    nameEn: 'English Opening',
    nameAr: 'الافتتاح الإنجليزي',
    moves: 'c4'
  },
  {
    eco: 'A04',
    nameEn: 'Réti Opening',
    nameAr: 'افتتاح ريتي',
    moves: 'Nf3'
  },
  {
    eco: 'A00',
    nameEn: "King's Indian Attack",
    nameAr: 'الهجوم الهندي للملك',
    moves: 'Nf3 d5 g3'
  }
];

export function identifyOpening(sanHistory: string[]): OpeningInfo | null {
  if (!sanHistory || sanHistory.length === 0) return null;
  const currentSanSequence = sanHistory.join(' ');
  
  // Find longest matching opening
  let bestMatch: OpeningInfo | null = null;
  let maxMatchedMoves = 0;

  for (const op of OPENINGS_DB) {
    if (currentSanSequence.startsWith(op.moves)) {
      const moveCount = op.moves.split(' ').length;
      if (moveCount > maxMatchedMoves) {
        maxMatchedMoves = moveCount;
        bestMatch = op;
      }
    }
  }

  return bestMatch;
}
