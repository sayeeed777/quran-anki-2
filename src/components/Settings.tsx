import React from 'react';
import { Moon, Sun, Volume2, Type, Download } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Settings: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode,
    fontSize,
    setFontSize,
    autoPlayAudio,
    toggleAutoPlayAudio
  } = useStore();

  const exportData = () => {
    const data = localStorage.getItem('quran-anki-storage');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quran-anki-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h2>

        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              darkMode ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                darkMode ? 'transform translate-x-7' : ''
              }`}
            />
          </button>
        </div>

        {/* Auto-play Audio */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">Auto-play Audio</span>
          </div>
          <button
            onClick={toggleAutoPlayAudio}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              autoPlayAudio ? 'bg-primary-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                autoPlayAudio ? 'transform translate-x-7' : ''
              }`}
            />
          </button>
        </div>

        {/* Font Size */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Type className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">
              Arabic Font Size: {fontSize}px
            </span>
          </div>
          <input
            type="range"
            min="16"
            max="36"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>Small</span>
            <span>Large</span>
          </div>
        </div>

        {/* Export Data */}
        <button
          onClick={exportData}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Download className="w-5 h-5" />
          Export Backup
        </button>

        {/* Info */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Quran Anki Enhanced v2.0.0
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1">
            Advanced spaced repetition for Quran memorization
          </p>
        </div>
      </div>
    </div>
  );
};