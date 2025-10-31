import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2, VolumeX, BookmarkPlus, BookmarkCheck, Share2,
  Copy, Heart, Repeat, Loader2, ChevronLeft, ChevronRight, Settings
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useSwipeGesture } from '../hooks/useSwipeGesture';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import type { Ayah, Translation, Quality } from '../types';

interface QuranCardProps {
  ayah: Ayah;
  translation: Translation | null;
  onRate: (quality: Quality) => void;
  showAnswer: boolean;
  onToggleAnswer: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}

export const QuranCard: React.FC<QuranCardProps> = ({
  ayah,
  translation,
  onRate,
  showAnswer,
  onToggleAnswer,
  onPrevious,
  onNext
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [repeatMode, setRepeatMode] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    bookmarks, addBookmark, removeBookmark,
    favorites, addFavorite, removeFavorite,
    fontSize = 36, autoPlayAudio = false,
  } = useStore();

  const ayahId = `${ayah.surah.number}:${ayah.numberInSurah}`;
  const isBookmarked = bookmarks.some((b) => b.ayahId === ayahId);
  const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;

  useEffect(() => {
    setIsFavorite(!!favorites?.some((f) => f.ayahId === ayahId));
  }, [favorites, ayahId]);

  // 🎧 Audio setup
  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleLoadStart = () => setAudioLoading(true);
    const handleCanPlay = () => { setAudioLoading(false); setAudioError(false); };
    const handleError = () => { setAudioLoading(false); setAudioError(true); };
    const handleEnded = () => {
      setIsPlaying(false);
      if (repeatMode) {
        setTimeout(() => audio.play().catch(() => setAudioError(true)), 400);
      }
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);
    audio.playbackRate = playbackSpeed;

    if (autoPlayAudio && showAnswer) {
      audio.play().catch(() => setAudioError(true));
      setIsPlaying(true);
    }

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [ayah.number, playbackSpeed, repeatMode, showAnswer, autoPlayAudio, audioUrl]);

  // 🧭 Cleanup
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const showNotification = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setShowToast(msg);
    toastTimeoutRef.current = setTimeout(() => setShowToast(null), 2000);
  };

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) { audio.pause(); setIsPlaying(false); }
      else { await audio.play(); setIsPlaying(true); }
    } catch {
      setAudioError(true);
      showNotification('Audio failed to play');
    }
  };

  const handleBookmark = () => {
    if (isBookmarked) {
      removeBookmark(ayahId);
      showNotification('Bookmark removed');
    } else {
      addBookmark({ ayahId, note: '', tags: [], createdAt: new Date() });
      showNotification('Bookmark added');
    }
  };

  const handleFavorite = () => {
    if (isFavorite) {
      removeFavorite(ayahId);
      setIsFavorite(false);
      showNotification('Removed from favorites');
    } else {
      addFavorite({ ayahId, createdAt: new Date() });
      setIsFavorite(true);
      showNotification('Added to favorites');
    }
  };

  const handleCopy = async () => {
    const text = `${ayah.text}\n\n${translation?.text || ''}\n— Quran ${ayah.surah.number}:${ayah.numberInSurah}`;
    try {
      await navigator.clipboard.writeText(text);
      showNotification('Copied to clipboard');
    } catch {
      showNotification('Failed to copy');
    }
  };

  const handleShare = async () => {
    const text = `${ayah.text}\n\n${translation?.text || ''}\n— Quran ${ayah.surah.number}:${ayah.numberInSurah}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        showNotification('Shared!');
      } catch { /* ignored */ }
    } else handleCopy();
  };

  const handleSpeedChange = (s: number) => {
    setPlaybackSpeed(s);
    if (audioRef.current) audioRef.current.playbackRate = s;
    showNotification(`Speed: ${s}x`);
    setShowSpeedMenu(false);
  };

  const toggleRepeatMode = () => {
    setRepeatMode((prev) => {
      const val = !prev;
      showNotification(val ? 'Repeat on' : 'Repeat off');
      return val;
    });
  };

  const handleRateWithFeedback = (q: Quality) => {
    onRate(q);
    const msgs: Record<Quality, string> = {
      0: 'Try again 💪', 1: 'Hard 😐', 2: 'Good 📚', 3: 'Great ✨', 4: 'Excellent 🌟', 5: 'Perfect 🎉'
    };
    showNotification(msgs[q]);
  };

  const swipeHandlers = useSwipeGesture(
    () => handleRateWithFeedback(2),
    () => handleRateWithFeedback(4)
  );

  useKeyboardShortcuts({
    ' ': (e) => { e?.preventDefault(); onToggleAnswer(); },
    Enter: () => onToggleAnswer(),
    '1': () => showAnswer && handleRateWithFeedback(1),
    '2': () => showAnswer && handleRateWithFeedback(2),
    '3': () => showAnswer && handleRateWithFeedback(3),
    '4': () => showAnswer && handleRateWithFeedback(4),
    '5': () => showAnswer && handleRateWithFeedback(5),
    a: toggleAudio,
    b: handleBookmark,
    f: handleFavorite,
    c: handleCopy,
    r: toggleRepeatMode,
    ArrowLeft: () => onPrevious?.(),
    ArrowRight: () => onNext?.(),
  });

  const speedOptions = [0.75, 1, 1.25, 1.5, 2];

  return (
    <>
      <div
        {...swipeHandlers}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-2xl w-full mx-auto relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between flex-wrap mb-6 mt-2">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Surah {ayah.surah.number}: {ayah.surah.englishName}
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              Ayah {ayah.numberInSurah}
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <button onClick={toggleAudio} disabled={audioLoading}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50">
              {audioLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
              ) : audioError ? (
                <VolumeX className="w-5 h-5 text-red-500" />
              ) : isPlaying ? (
                <Volume2 className="w-5 h-5 text-primary-600 animate-pulse" />
              ) : (
                <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Settings className="w-5 h-5" />
            </button>

            {showSpeedMenu && (
              <div className="absolute top-12 right-0 bg-white dark:bg-gray-700 rounded-lg shadow-lg p-2 z-20">
                {speedOptions.map(s => (
                  <button key={s}
                    onClick={() => handleSpeedChange(s)}
                    className={`block px-3 py-2 rounded text-sm w-full text-left ${
                      playbackSpeed === s
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}>
                    {s}x
                  </button>
                ))}
              </div>
            )}

            <button onClick={toggleRepeatMode}
              className={`p-2 rounded-lg ${repeatMode
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <Repeat className="w-5 h-5" />
            </button>

            <button onClick={handleFavorite}
              className={`p-2 rounded-lg ${isFavorite
                ? 'bg-red-100 text-red-600'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>

            <button onClick={handleBookmark}
              className={`p-2 rounded-lg ${isBookmarked
                ? 'bg-yellow-100 text-yellow-600'
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <BookmarkPlus className="w-5 h-5" />}
            </button>

            <button onClick={handleCopy}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
              <Copy className="w-5 h-5" />
            </button>

            <button onClick={handleShare}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Arabic Text */}
        <div className="flex justify-center mb-8 px-2">
          <p
            className="font-arabic text-gray-900 dark:text-white leading-loose whitespace-pre-wrap"
            style={{ fontSize: `${fontSize || 38}px`, maxWidth: '95%' }}
            dir="rtl"
            lang="ar"
          >
            {ayah.text}
          </p>
        </div>

        {/* Translation */}
        {showAnswer && (
          <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 animate-fadeIn">
            <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg">
              {translation?.text || 'Translation unavailable'}
            </p>
          </div>
        )}

        {/* Navigation */}
        {(onPrevious || onNext) && (
          <div className="flex justify-between mb-4">
            <button onClick={onPrevious}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={onNext}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Buttons */}
        {!showAnswer ? (
          <button
            onClick={onToggleAnswer}
            className="w-full py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all font-semibold text-lg shadow-md"
          >
            Show Translation
          </button>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((q) => (
              <button
                key={q}
                onClick={() => handleRateWithFeedback(q as Quality)}
                className="py-3 bg-gray-200 hover:bg-primary-600 hover:text-white text-sm rounded-lg transition-all font-semibold"
              >
                {['😓','😐','🙂','😊','🤩'][q-1]}<br />{['Again','Hard','Good','Easy','Perfect'][q-1]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-slideUp">
          {showToast}
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from {opacity:0;transform:translateY(-10px);} to {opacity:1;transform:translateY(0);} }
        @keyframes slideUp { from {opacity:0;transform:translate(-50%,20px);} to {opacity:1;transform:translate(-50%,0);} }
        .animate-fadeIn { animation: fadeIn .3s ease-out; }
        .animate-slideUp { animation: slideUp .3s ease-out; }
      `}</style>
    </>
  );
};

