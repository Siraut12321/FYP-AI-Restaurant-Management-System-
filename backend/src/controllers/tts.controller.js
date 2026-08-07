import * as ttsService from '../services/tts.service.js';

// ─── Generate TTS Audio ───────────────────────────────────────────────────────
export const generateTTS = async (req, res, next) => {
  try {
    const { text, language } = req.body;
    const result = await ttsService.generateSpeech({ text, language });

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `inline; filename="${result.filename}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.send(result.audioBuffer);

    // Intentionally no DB/storage writes.
    // The API returns audio bytes directly for browser playback.
  } catch (err) {
    next(err);
  }
};
