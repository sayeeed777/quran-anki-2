// src/store/useStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReviewCard, StudySession, Bookmark, StudyGoal, Quality, Favorite } from '../types';

interface AppState {
  // Review system
  reviewCards: Map<string, ReviewCard>;
  addReviewCard: (ayahId: string) => void;
  updateReviewCard: (ayahId: string, quality: Quality) => void;
  getDueCards: () => ReviewCard[];
  
  // Study sessions
  currentSession: StudySession | null;
  sessions: StudySession[];
  startSession: () => void;
  endSession: () => void;
  recordReview: (ayahId: string, correct: boolean) => void;
  
  // Bookmarks
  bookmarks: Bookmark[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (ayahId: string) => void;
  
  // ✅ FAVORITES
  favorites: Favorite[];
  addFavorite: (favorite: Favorite) => void;
  removeFavorite: (ayahId: string) => void;
  
  // Goals
  goals: StudyGoal[];
  updateGoal: (type: StudyGoal['type'], progress: number) => void;
  
  // Settings
  darkMode: boolean;
  toggleDarkMode: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  autoPlayAudio: boolean;
  toggleAutoPlayAudio: () => void;
  
  // Statistics
  streak: number;
  totalReviews: number;
  lastReviewDate: string | null;
  updateStreak: () => void;
}

const calculateNextReview = (
  card: ReviewCard,
  quality: Quality
): Partial<ReviewCard> => {
  let { interval, easeFactor, repetitions } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(1.3, easeFactor);
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  return {
    interval,
    easeFactor,
    repetitions,
    nextReview,
    lastReviewed: new Date()
  };
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Review cards
      reviewCards: new Map(),
      addReviewCard: (ayahId) => {
        const cards = new Map(get().reviewCards);
        if (!cards.has(ayahId)) {
          cards.set(ayahId, {
            ayahId,
            nextReview: new Date(),
            interval: 1,
            easeFactor: 2.5,
            repetitions: 0,
            lastReviewed: null
          });
          set({ reviewCards: cards });
        }
      },
      updateReviewCard: (ayahId, quality) => {
        const cards = new Map(get().reviewCards);
        const card = cards.get(ayahId);
        if (card) {
          const updates = calculateNextReview(card, quality);
          cards.set(ayahId, { ...card, ...updates });
          set({ reviewCards: cards, totalReviews: get().totalReviews + 1 });
          get().updateStreak();
        }
      },
      getDueCards: () => {
        const now = new Date();
        return Array.from(get().reviewCards.values()).filter(
          card => new Date(card.nextReview) <= now
        );
      },

      // Study sessions
      currentSession: null,
      sessions: [],
      startSession: () => {
        set({
          currentSession: {
            id: Date.now().toString(),
            startTime: new Date(),
            endTime: null,
            ayahsReviewed: [],
            correctCount: 0,
            totalCount: 0
          }
        });
      },
      endSession: () => {
        const session = get().currentSession;
        if (session) {
          const completedSession = {
            ...session,
            endTime: new Date()
          };
          set({
            currentSession: null,
            sessions: [...get().sessions, completedSession]
          });
        }
      },
      recordReview: (ayahId, correct) => {
        const session = get().currentSession;
        if (session) {
          set({
            currentSession: {
              ...session,
              ayahsReviewed: [...session.ayahsReviewed, ayahId],
              correctCount: correct ? session.correctCount + 1 : session.correctCount,
              totalCount: session.totalCount + 1
            }
          });
        }
      },

      // Bookmarks
      bookmarks: [],
      addBookmark: (bookmark) => {
        set({ bookmarks: [...get().bookmarks, bookmark] });
      },
      removeBookmark: (ayahId) => {
        set({
          bookmarks: get().bookmarks.filter(b => b.ayahId !== ayahId)
        });
      },

      // ✅ FAVORITES
      favorites: [],
      addFavorite: (favorite) => {
        set({ favorites: [...get().favorites, favorite] });
      },
      removeFavorite: (ayahId) => {
        set({
          favorites: get().favorites.filter(f => f.ayahId !== ayahId)
        });
      },

      // Goals
      goals: [
        { type: 'daily', target: 20, current: 0, period: new Date().toDateString() },
        { type: 'weekly', target: 100, current: 0, period: new Date().toISOString().slice(0, 10) },
        { type: 'monthly', target: 400, current: 0, period: new Date().toISOString().slice(0, 7) }
      ],
      updateGoal: (type, progress) => {
        set({
          goals: get().goals.map(goal =>
            goal.type === type ? { ...goal, current: goal.current + progress } : goal
          )
        });
      },

      // Settings
      darkMode: false,
      toggleDarkMode: () => set({ darkMode: !get().darkMode }),
      fontSize: 20,
      setFontSize: (size) => set({ fontSize: size }),
      autoPlayAudio: true,
      toggleAutoPlayAudio: () => set({ autoPlayAudio: !get().autoPlayAudio }),

      // Statistics
      streak: 0,
      totalReviews: 0,
      lastReviewDate: null,
      updateStreak: () => {
        const today = new Date().toDateString();
        const lastDate = get().lastReviewDate;
        if (lastDate === today) {
          return;
        }
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastDate === yesterday.toDateString()) {
          set({ streak: get().streak + 1, lastReviewDate: today });
        } else if (lastDate === null || lastDate !== today) {
          set({ streak: 1, lastReviewDate: today });
        }
      }
    }),
    {
      name: 'quran-anki-storage',
      partialize: (state) => ({
        reviewCards: Array.from(state.reviewCards.entries()),
        sessions: state.sessions,
        bookmarks: state.bookmarks,
        favorites: state.favorites,
        goals: state.goals,
        darkMode: state.darkMode,
        fontSize: state.fontSize,
        autoPlayAudio: state.autoPlayAudio,
        streak: state.streak,
        totalReviews: state.totalReviews,
        lastReviewDate: state.lastReviewDate
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.reviewCards)) {
          state.reviewCards = new Map(state.reviewCards);
        }
      }
    }
  )
);