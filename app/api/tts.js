// ART AI: Dual-Engine Serverless TTS
// Engine 1: Microsoft Edge Neural TTS vi-VN-NamMinhNeural (Thầy Cọ Nhí)
// Engine 2: Google Vietnamese TTS (Auto-fallback & sentence concatenation)

import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import https from 'https';

const ttsCache = new Map();

function fetchGoogleTtsChunk(text) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=vi&client=tw-ob`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Google TTS status: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    }).on('error', reject);
  });
}

async function synthesizeGoogleTts(cleanText) {
  const words = cleanText.split(/\s+/);
  const segments = [];
  let current = '';

  for (const word of words) {
    if ((current + ' ' + word).trim().length <= 150) {
      current = (current + ' ' + word).trim();
    } else {
      if (current) segments.push(current);
      current = word;
    }
  }
  if (current) segments.push(current);

  const buffers = [];
  for (const seg of segments) {
    const buf = await fetchGoogleTtsChunk(seg);
    if (buf && buf.length > 0) buffers.push(buf);
  }
  return Buffer.concat(buffers);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const text = (req.query && req.query.text) || '';
  if (!text) {
    return res.status(400).send('Missing text parameter');
  }

  const cleanText = text
    .replace(/[#*_`~-]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/https?:\/\/\S+/g, '')
    .slice(0, 600)
    .trim();

  if (!cleanText) {
    return res.status(400).send('Empty text');
  }

  const voiceParam = (req.query && req.query.voice) || 'male';
  const voiceName = (voiceParam === 'female' || voiceParam === 'vi-VN-HoaiMyNeural' || String(voiceParam).toLowerCase().includes('nu') || String(voiceParam).toLowerCase().includes('hoaimy'))
    ? 'vi-VN-HoaiMyNeural'
    : 'vi-VN-NamMinhNeural';
  const isFemale = voiceName === 'vi-VN-HoaiMyNeural';
  const cacheKey = `${voiceName}_${cleanText}`;

  if (ttsCache.has(cacheKey)) {
    const cached = ttsCache.get(cacheKey);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', cached.length);
    res.setHeader('X-TTS-Voice', voiceName);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800');
    return res.status(200).send(cached);
  }

  return new Promise(async (resolve) => {
    let finished = false;
    const finish = (statusCode, body, headers = {}) => {
      if (finished) return;
      finished = true;
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      res.setHeader('X-TTS-Voice', voiceName);
      if (!res.headersSent) {
        res.status(statusCode).send(body);
      }
      resolve();
    };

    // 1. Primary: Microsoft Edge Neural TTS
    const tryEdgeTTS = () => {
      return new Promise(async (resEdge, rejEdge) => {
        const timeout = setTimeout(() => rejEdge(new Error('Edge TTS timeout')), 5000);
        try {
          const tts = new MsEdgeTTS();
          await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
          const { audioStream } = tts.toStream(cleanText);
          const chunks = [];
          audioStream.on('data', (c) => chunks.push(c));
          audioStream.on('end', () => {
            clearTimeout(timeout);
            resEdge(Buffer.concat(chunks));
          });
          audioStream.on('error', (err) => {
            clearTimeout(timeout);
            rejEdge(err);
          });
        } catch (e) {
          clearTimeout(timeout);
          rejEdge(e);
        }
      });
    };

    try {
      const edgeBuffer = await tryEdgeTTS();
      if (edgeBuffer && edgeBuffer.length > 0) {
        ttsCache.set(cacheKey, edgeBuffer);
        return finish(200, edgeBuffer, {
          'Content-Type': 'audio/mpeg',
          'Content-Length': edgeBuffer.length,
          'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
        });
      }
    } catch (edgeErr) {
      console.warn(`[TTS] Edge Neural (${voiceName}) failed:`, edgeErr.message);
    }

    // 2. Secondary Fallback:
    // CHÚ Ý BẢO VỆ GIỌNG NAM: Google Vietnamese TTS là giọng NỮ 100%.
    // Chỉ kích hoạt Google TTS khi người dùng chọn Cô giáo (isFemale = true).
    if (isFemale) {
      try {
        const googleBuffer = await synthesizeGoogleTts(cleanText);
        if (googleBuffer && googleBuffer.length > 0) {
          ttsCache.set(cacheKey, googleBuffer);
          return finish(200, googleBuffer, {
            'Content-Type': 'audio/mpeg',
            'Content-Length': googleBuffer.length,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800'
          });
        }
      } catch (googleErr) {
        console.error('[TTS] Google TTS fallback failed:', googleErr.message);
      }
    }

    finish(500, `TTS Engine Unavailable for ${voiceName}`);
  });
}
