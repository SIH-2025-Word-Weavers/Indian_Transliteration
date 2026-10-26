import { SCRIPT_TTS_LANG } from '../config/languages';

/**
 * Text-to-speech through the browser's Web Speech API (no network service, no dependency).
 * Whether a voice exists for a given Indian language depends on the device/OS: the app can only report it.
 */

export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

/** Speech language tag for a script name ("Telugu" -> "te-IN"), or null if unknown. */
export function getSpeechLangForScript(script) {
  return SCRIPT_TTS_LANG[script] || null;
}

/**
 * Pick the best installed voice for a BCP-47 tag: exact match first, then same primary language.
 * @param {Array<{lang:string,name?:string}>} voices
 * @param {string} lang e.g. "te-IN"
 */
export function pickVoice(voices, lang) {
  if (!voices || !lang) return null;
  const norm = (s) => String(s).replace('_', '-').toLowerCase();
  const want = norm(lang);
  const primary = want.split('-')[0];
  return (
    voices.find((v) => norm(v.lang) === want) ||
    voices.find((v) => norm(v.lang).split('-')[0] === primary) ||
    null
  );
}

/** Voices load asynchronously in some browsers; resolve once they are available (or after a short wait). */
export function loadVoices(timeoutMs = 1500) {
  return new Promise((resolve) => {
    if (!isSpeechSupported()) return resolve([]);
    const synth = window.speechSynthesis;
    const now = synth.getVoices();
    if (now.length) return resolve(now);
    const done = () => resolve(synth.getVoices());
    synth.addEventListener?.('voiceschanged', done, { once: true });
    setTimeout(done, timeoutMs);
  });
}

/**
 * Speak `text` in `lang`.
 * @returns {Promise<{ok:boolean, reason?:string, voice?:string}>} ok=false with a reason when speech cannot be produced.
 */
export async function speak(text, lang) {
  if (!isSpeechSupported()) return { ok: false, reason: 'Speech is not supported in this browser.' };
  if (!text || !text.trim()) return { ok: false, reason: 'There is no text to speak.' };
  if (!lang) return { ok: false, reason: 'Unknown language for speech.' };
  const voices = await loadVoices();
  const voice = pickVoice(voices, lang);
  if (!voice) {
    return { ok: false, reason: `No ${lang} voice is installed on this device. Install one in the system speech settings.` };
  }
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  synth.speak(utterance);
  return { ok: true, voice: voice.name };
}

export function stopSpeaking() {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}
