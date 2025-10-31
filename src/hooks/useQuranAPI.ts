// src/hooks/useQuranAPI.ts
import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Ayah, Translation } from '../types';
import { TRANSLATIONS } from '../config/translations';

interface QuranResponse {
  data?: Ayah;
}

interface TranslationResponse {
  data?: {
    text?: string;
  };
}

export const useQuranAPI = (ayahNumber: number, translationId: string = 'en.sahih') => {
  const [ayah, setAyah] = useState<Ayah | null>(null);
  const [translation, setTranslation] = useState<Translation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAyahData = async () => {
      try {
        setLoading(true);
        setError(null);

        const transMeta = TRANSLATIONS.find(t => t.id === translationId) || TRANSLATIONS[0];

        const [ayahRes, transRes] = await Promise.allSettled([
          // ✅ Fixed: Removed extra spaces
          axios.get<QuranResponse>(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/ar.alafasy`),
          axios.get<TranslationResponse>(`https://api.alquran.cloud/v1/ayah/${ayahNumber}/${transMeta.id}`)
        ]);

        if (!isMounted) return;

        if (ayahRes.status === 'fulfilled' && ayahRes.value.data?.data) {
          setAyah(ayahRes.value.data.data);
        } else {
          console.warn('Ayah data missing or failed:', ayahRes);
        }

        if (transRes.status === 'fulfilled' && transRes.value.data?.data?.text) {
          setTranslation({
            text: transRes.value.data.data.text,
            edition: transMeta.name,
            translator: transMeta.translator,
            language: transMeta.language
          });
        } else {
          console.warn('Translation data missing or failed:', transRes);
        }

        if (
          (ayahRes.status === 'rejected' || !ayahRes.value.data?.data) &&
          (transRes.status === 'rejected' || !transRes.value.data?.data?.text)
        ) {
          setError('Failed to load ayah or translation. Please try again.');
        }

      } catch (err) {
        console.error('API Error:', err);
        if (isMounted) setError('Network error while loading ayah.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAyahData();

    return () => {
      isMounted = false;
    };
  }, [ayahNumber, translationId]);

  return { ayah, translation, loading, error };
};