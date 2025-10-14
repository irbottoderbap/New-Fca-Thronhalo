const axios = require('axios'); const fs = require('fs'); const path = require('path');

module.exports = {

config: { name: 'zephyr', version: '2.4.0', author: 'israfil', countDown: 3, role: 0, shortDescription: { en: 'Zephyr-style online TTS', bn: 'জেফির স্টাইল অনলাইন TTS' }, category: 'media', guide: { en: '{pn} say <text>', bn: '{pn} say <টেক্সট>' } },

onStart: async function({ message, event, args }) { try { // Use your new API key and Voice ID const API_KEY = 'sk_8462c49ab60e55c64f40eece5f9230a6c09ded9a5f4b2d92'; const VOICE_ID = 'e9qPWrA6NoMJ8AHIZbb7'; // your new voice ID

const sub = (args[0] || '').toLowerCase();
  if (sub !== 'say') return message.reply('ব্যবহার করুন: /zephyr say <টেক্সট>');

  let text = args.slice(1).join(' ').trim();
  if (!text && event?.messageReply?.body) text = String(event.messageReply.body).trim();
  if (!text) return message.reply('অনুগ্রহ করে কিছু টেক্সট প্রদান করুন।');

  await message.reply('🎙️ Zephyr voice তৈরি করা হচ্ছে…');

  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;
  const payload = {
    text,
    model_id: 'eleven_multilingual_v2',
    voice_settings: {
      stability: 0.35,
      similarity_boost: 0.85,
      style: 0.5,
      use_speaker_boost: true
    },
    voice_prompt: 'Speak in a calm, confident, slightly seductive female voice. Tone: authoritative, smooth, slightly playful. Emotion: subtle control and charm, like Makima from Chainsaw Man.'
  };

  const res = await axios.post(url, payload, {
    responseType: 'arraybuffer',
    headers: {
      Accept: 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': API_KEY
    },
    timeout: 60000
  });

  const tmpDir = path.join(__dirname, 'tmp');
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
  const outPath = path.join(tmpDir, `makima_${Date.now()}.mp3`);
  fs.writeFileSync(outPath, Buffer.from(res.data));

  await message.reply({ attachment: fs.createReadStream(outPath) });

  setTimeout(() => { try { fs.unlinkSync(outPath); } catch(e) {} }, 15000);

} catch (err) {
  console.error('[makima online]', err?.response?.data || err);
  message.reply('❌ ভয়েস তৈরি করতে ব্যর্থ হয়েছে: ' + (err?.response?.data?.detail || err.message || 'অজানা ত্রুটি'));
}

}, };
