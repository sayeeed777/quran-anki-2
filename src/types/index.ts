// src/types/index.ts
export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  surah: {
    number: number;
    name: string;
    englishName: string;
    numberOfAyahs: number;
  };
}
// src/types/index.ts
export interface KeyboardShortcuts {
  [key: string]: (e?: KeyboardEvent) => void;
}

// ✅ CORRECTED TRANSLATION INTERFACE
export interface Translation {
  text: string;        // ✅ The actual translation text
  edition: string;     // ✅ e.g., "Arberry", "Pickthall"
  translator: string;  // ✅ e.g., "A. J. Arberry"
  language: string;    // ✅ e.g., "en"
}

export type Quality = 0 | 1 | 2 | 3 | 4 | 5;

export interface Bookmark {
  ayahId: string;
  note: string;
  tags: string[];
  createdAt: Date;
}

export interface Favorite {
  ayahId: string;
  createdAt: Date;
}

export interface ReviewCard {
  ayahId: string;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
  lastReviewed: Date | null;
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime: Date | null;
  ayahsReviewed: string[];
  correctCount: number;
  totalCount: number;
}

export interface StudyGoal {
  type: 'daily' | 'weekly' | 'monthly';
  target: number;
  current: number;
  period: string;
}