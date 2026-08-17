import test from 'node:test';
import assert from 'node:assert/strict';
import { selectVoiceForLanguage } from './speechService.js';

test('selectVoiceForLanguage prefers an exact English voice match', () => {
  const voices = [
    { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Ava', lang: 'en-GB' },
  ];

  const voice = selectVoiceForLanguage('en', voices);
  assert.equal(voice?.lang, 'en-US');
});

test('selectVoiceForLanguage returns null for Urdu when no Urdu voice exists', () => {
  const voices = [
    { name: 'Google US English', lang: 'en-US' },
    { name: 'Ava', lang: 'en-GB' },
  ];

  const voice = selectVoiceForLanguage('ur', voices);
  assert.equal(voice, null);
});
