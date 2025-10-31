import { useState } from 'react';
import { QuranCard } from './components/QuranCard';
import { useQuranAPI } from './hooks/useQuranAPI';
import { TRANSLATIONS } from './config/translations';

const TOTAL_AYAHS = 6236; // Total verses in the Quran

function App() {
  const [currentAyahNumber, setCurrentAyahNumber] = useState(1);
  const [selectedTranslation, setSelectedTranslation] = useState('en.sahih');
  const [showAnswer, setShowAnswer] = useState(false);

  const { ayah, translation, loading, error } = useQuranAPI(
    currentAyahNumber,
    selectedTranslation
  );

  const handleRate = (quality: number) => {
    console.log('Rated ayah:', currentAyahNumber, 'Quality:', quality);
    nextAyah();
  };

  const toggleAnswer = () => setShowAnswer(!showAnswer);

  const nextAyah = () => {
    setShowAnswer(false);
    setCurrentAyahNumber((prev) => Math.min(prev + 1, TOTAL_AYAHS));
  };

  const prevAyah = () => {
    setShowAnswer(false);
    setCurrentAyahNumber((prev) => Math.max(prev - 1, 1));
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">
          Loading Ayah {currentAyahNumber}...
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Translation:{' '}
          {TRANSLATIONS.find((t) => t.id === selectedTranslation)?.name}
        </p>
      </div>
    );
  }

  // Error state
  if (error || !ayah) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-6 rounded-xl shadow max-w-md">
          <p>{error || 'Failed to load ayah'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
     
      className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-start py-8 px-4"

     > 
      {/* Header */}
      <div className="max-w-2xl text-center mb-8" dir="ltr">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Quran Anki - Enhanced
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Ayah {currentAyahNumber} of {TOTAL_AYAHS}
        </p>

        {/* Translation Selector */}
        <div className="mt-4">
          <label
            htmlFor="translation"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Translation
          </label>
          <select
            id="translation"
            value={selectedTranslation}
            onChange={(e) => setSelectedTranslation(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {TRANSLATIONS.map((trans) => (
              <option key={trans.id} value={trans.id}>
                {trans.name}
              </option>
            ))}
          </select>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-4 flex justify-center gap-3">
          <button
            onClick={prevAyah}
            disabled={currentAyahNumber <= 1}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 disabled:opacity-40"
          >
            ⬅ Previous
          </button>
          <button
            onClick={nextAyah}
            disabled={currentAyahNumber >= TOTAL_AYAHS}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Next ➡
          </button>
        </div>
      </div>

      {/* Quran Card */}
<QuranCard
  ayah={ayah}
  translation={translation}
  onRate={handleRate}
  showAnswer={showAnswer}
  onToggleAnswer={toggleAnswer}
  onPrevious={prevAyah}
  onNext={nextAyah}
/>
      {/* Translation credit */}
      {translation && (
        <div
          dir="ltr"
          className="max-w-2xl mt-6 text-center text-xs text-gray-500 dark:text-gray-400"
        >
          <p>Translation by {translation.translator}</p>
        </div>
      )}
    </div>
  );
}

export default App;
