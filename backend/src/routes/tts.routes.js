import { Router } from 'express';
import { generateTTS } from '../controllers/tts.controller.js';
import { ttsValidator } from '../validators/tts.validator.js';

const router = Router();

// ─── TTS Route ────────────────────────────────────────────────────────────────
router.post('/', ttsValidator, generateTTS);

export default router;
