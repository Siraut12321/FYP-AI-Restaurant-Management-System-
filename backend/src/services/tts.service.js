import OpenAI from 'openai';
import AppError from '../utils/AppError.js';

const apiKey = process.env.OPENAI_API_KEY;

const openai = apiKey ? new OpenAI({ apiKey }) : null;

// ─── Generate speech audio from text ─────────────────────────────────────────
export const generateSpeech = async ({ text, language }) => {
  if (!openai) {
    throw new AppError('OpenAI API key is not configured on the backend.', 500);
  }

  try {
    const model = process.env.OPENAI_TTS_MODEL || 'gpt-4o-mini-tts';
    const voice = process.env.OPENAI_TTS_VOICE || (language === 'ur' ? 'nova' : 'alloy');

    const mp3 = await openai.audio.speech.create({
      model,
      voice,
      input: String(text).trim(),
      response_format: 'mp3',
    });

    const audioBuffer = Buffer.from(await mp3.arrayBuffer());

    return {
      audioBuffer,
      contentType: 'audio/mpeg',
      filename: `tts-${Date.now()}.mp3`,
    };
  } catch (error) {
    const message = error?.response?.data?.error?.message || error.message || 'OpenAI TTS generation failed.';
    throw new AppError(message, 500);
  }
};
