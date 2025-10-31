import { useEffect } from 'react';

interface Shortcuts {
  [key: string]: (e?: KeyboardEvent) => void;
}

export const useKeyboardShortcuts = (shortcuts: Shortcuts) => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const handler = shortcuts[e.key];
      if (handler && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handler();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [shortcuts]);
};