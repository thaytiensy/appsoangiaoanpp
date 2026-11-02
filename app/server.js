// Standalone Production Server for ART AI
// Runs in Docker, Render, Railway, VPS, or local production

import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import https from 'https';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg'
};

const ttsCache = new Map();

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // 1. API: Text-to-Speech
  if (pathname === '/api/tts') {
    await handleTts(req, res, parsedUrl);
    return;
  }

  // 2. API: Mở Trực Tiếp Microsoft PowerPoint (POWERPNT.EXE) trên máy tính
  if (pathname === '/api/open-powerpoint') {
    handleOpenPowerpoint(req, res);
    return;
  }

  // 3. Static Assets from dist/
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);

  if (!fs.existsSync(filePath)) {
    // SPA Fallback to index.html
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error loading file');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    res.end(content);
  });
});

function handleOpenPowerpoint(req, res) {
  try {
    const pptPath = 'C:\\Program Files (x86)\\Microsoft Office\\root\\Office16\\POWERPNT.EXE';
    const fallbackPath = 'C:\\Program Files\\Microsoft Office\\root\\Office16\\POWERPNT.EXE';
    const exe = fs.existsSync(pptPath) ? pptPath : (fs.existsSync(fallbackPath) ? fallbackPath : 'powerpnt.exe');

    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        let targetFile = '';
        if (chunks.length > 0) {
          const buffer = Buffer.concat(chunks);
          const tempPptx = path.join(os.tmpdir(), 'BaiGiang_MiThuat_GDPT2018.pptx');
          fs.writeFileSync(tempPptx, buffer);
          targetFile = tempPptx;
        }

        const cmd = targetFile ? `start "" "${exe}" "${targetFile}"` : `start "" "${exe}"`;
        spawn('cmd.exe', ['/c', cmd], { windowsHide: true, detached: true });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true, 
          message: 'Đã kích hoạt Microsoft PowerPoint (POWERPNT.EXE) thành công trên máy tính!' 
        }));
      } catch (err) {
        console.error('Lỗi khi mở PowerPoint:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
  } catch (e) {
    console.error('Lỗi middleware open-powerpoint:', e);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: e.message }));
  }
}

async function handleTts(req, res, url) {
  const text = url.searchParams.get('text');
  if (!text) {
    res.writeHead(400);
    res.end('Missing text');
    return;
  }

  const cleanText = text
    .replace(/[#*_`~-]/g, '')
    .replace(/\n+/g, '. ')
    .replace(/https?:\/\/\S+/g, '')
    .slice(0, 600)
    .trim();

  const voiceParam = url.searchParams.get('voice') || 'male';
  const voice = (voiceParam === 'female' || voiceParam === 'vi-VN-HoaiMyNeural' || String(voiceParam).toLowerCase().includes('nu') || String(voiceParam).toLowerCase().includes('hoaimy'))
    ? 'vi-VN-HoaiMyNeural'
    : 'vi-VN-NamMinhNeural';
  const cacheKey = `${voice}_${cleanText}`;

  if (ttsCache.has(cacheKey)) {
    const buf = ttsCache.get(cacheKey);
    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Content-Length': buf.length,
      'Cache-Control': 'public, max-age=86400'
    });
    res.end(buf);
    return;
  }

  // Ưu tiên 1: Pure Node.js WebSocket Edge-TTS
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    const { audioStream } = tts.toStream(cleanText);

    res.writeHead(200, {
      'Content-Type': 'audio/mpeg',
      'Transfer-Encoding': 'chunked',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=86400'
    });

    const chunks = [];
    audioStream.on('data', (c) => {
      chunks.push(c);
      if (!res.writableEnded) res.write(c);
    });

    audioStream.on('end', () => {
      if (chunks.length > 0) {
        ttsCache.set(cacheKey, Buffer.concat(chunks));
      }
      if (!res.writableEnded) res.end();
    });

    audioStream.on('error', (err) => {
      console.error('MsEdgeTTS server stream error:', err);
      if (!res.writableEnded) res.end();
    });

    req.on('close', () => {
      try { tts.close(); } catch (e) {}
    });
    return;
  } catch (wsErr) {
    console.warn('MsEdgeTTS failed, falling back to standalone edge-tts.exe:', wsErr.message);
  }

  // Ưu tiên 2: Standalone edge-tts.exe
  const tempFile = path.join(os.tmpdir(), `tts_${Date.now()}_${Math.random().toString(36).slice(2)}.txt`);
  fs.writeFileSync(tempFile, cleanText, 'utf8');

  let processClosed = false;
  const chunks = [];

  const cleanup = () => {
    try { if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile); } catch (e) {}
  };

  const localEdgeExe = path.join(os.homedir(), '.local', 'bin', 'edge-tts.exe');
  const useDirectExe = fs.existsSync(localEdgeExe);
  const exeCmd = useDirectExe ? localEdgeExe : 'uvx';
  const exeArgs = useDirectExe
    ? ['--voice', voice, '--file', tempFile, '--write-media', '-']
    : ['edge-tts', '--voice', voice, '--file', tempFile, '--write-media', '-'];

  res.writeHead(200, {
    'Content-Type': 'audio/mpeg',
    'Transfer-Encoding': 'chunked',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=86400'
  });

  const p = spawn(exeCmd, exeArgs, { windowsHide: true });

  p.stdout.on('data', c => {
    chunks.push(c);
    if (!res.writableEnded) {
      res.write(c);
    }
  });

  p.on('close', code => {
    processClosed = true;
    cleanup();
    if (code === 0 && chunks.length > 0) {
      const audioBuffer = Buffer.concat(chunks);
      ttsCache.set(cacheKey, audioBuffer);
      if (!res.writableEnded) {
        res.end();
      }
    } else {
      if (!res.writableEnded) {
        res.end();
      }
    }
  });

  p.on('error', (err) => {
    cleanup();
    if (!processClosed && !res.writableEnded) {
      processClosed = true;
      res.end();
    }
  });

  setTimeout(() => {
    if (!processClosed) {
      processClosed = true;
      cleanup();
      try { p.kill(); } catch (e) {}
      if (!res.writableEnded) {
        res.end();
      }
    }
  }, 12000);
}

server.listen(PORT, () => {
  console.log(`🎨 ART AI Production Server running on http://localhost:${PORT}`);
});
