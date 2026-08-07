import axios from 'axios';

const STORAGE_KEY = 'restaurant_ai_voice_enabled';
const TTS_API_URL = import.meta.env.VITE_TTS_API_URL || 'http://localhost:5000/api/v1/tts';

const normalizeLanguageCode = (language = 'en') => {
  const normalizedLanguage = typeof language === 'string' ? language.toLowerCase() : 'en';
  return normalizedLanguage === 'ur' ? 'ur' : 'en';
};

export const getStoredVoicePreference = () => {
  if (typeof window === 'undefined') return true;

  const storedValue = window.localStorage.getItem(STORAGE_KEY);
  return storedValue === 'false' ? false : true;
};

export const setStoredVoicePreference = (enabled) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, String(enabled));
};

export const selectVoiceForLanguage = (language, voices = []) => {
  if (!Array.isArray(voices) || voices.length === 0) {
    return null;
  }

  const normalizedLanguage = language === 'ur' ? 'ur' : 'en';
  const preferredPrefixes = normalizedLanguage === 'ur' ? ['ur-PK', 'ur'] : ['en-US', 'en'];

  const exactMatch = voices.find((voice) => preferredPrefixes.some((prefix) => voice.lang === prefix));
  if (exactMatch) {
    return exactMatch;
  }

  const fallbackMatch = voices.find((voice) => preferredPrefixes.some((prefix) => voice.lang?.startsWith(prefix)));
  if (fallbackMatch) {
    return fallbackMatch;
  }

  if (normalizedLanguage === 'ur') {
    return null;
  }

  return voices[0] || null;
};

export const createSpeechService = () => {
  let currentAudio = null;
  let currentObjectUrl = null;

  const stop = () => {
    if (currentAudio) {
      try {
        currentAudio.pause();
      } catch (error) {
        // Ignore pause errors while stopping audio.
      }

      try {
        currentAudio.currentTime = 0;
      } catch (error) {
        // Ignore currentTime reset errors while stopping audio.
      }

      currentAudio.src = '';
      currentAudio = null;
    }

    if (currentObjectUrl) {
      URL.revokeObjectURL(currentObjectUrl);
      currentObjectUrl = null;
    }
  };

  const getAvailableVoices = () => [];

  const speak = async (text, language = 'en') => {
    const normalizedText = typeof text === 'string' ? text.trim() : '';
    const normalizedLanguage = normalizeLanguageCode(language);

    if (!normalizedText) {
      return { ok: false, reason: 'invalid-text' };
    }

    if (typeof window === 'undefined' || typeof Audio === 'undefined') {
      return { ok: false, reason: 'unsupported' };
    }

    stop();

    try {
      const response = await axios.post(
        TTS_API_URL,
        {
          text: normalizedText,
          language: normalizedLanguage,
        },
        {
          responseType: 'blob',
        }
      );

      const audioBlob = response?.data;
      if (!(audioBlob instanceof Blob) || audioBlob.size === 0) {
        return { ok: false, reason: 'empty-audio' };
      }

      const objectUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(objectUrl);

      currentObjectUrl = objectUrl;
      currentAudio = audio;

      const cleanup = () => {
        if (currentAudio === audio) {
          currentAudio = null;
        }

        if (currentObjectUrl === objectUrl) {
          URL.revokeObjectURL(objectUrl);
          currentObjectUrl = null;
        }
      };

      audio.onended = cleanup;
      audio.onerror = cleanup;
      audio.onpause = () => {
        if (audio.currentTime === 0 && currentAudio === audio) {
          cleanup();
        }
      };

      try {
        await audio.play();
        return { ok: true, reason: null };
      } catch (playError) {
        cleanup();
        return { ok: false, reason: 'playback-failed', error: playError };
      }
    } catch (error) {
      stop();
      return { ok: false, reason: 'tts-error', error };
    }
  };

  return { speak, stop, getAvailableVoices };
};

export const speechService = createSpeechService();
