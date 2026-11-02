import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import https from 'https';
import fs from 'fs';
import path from 'path';
import os from 'os';

// In-memory cache for ultra-fast instant voice responses
const ttsCache = new Map();

export default defineConfig({
  base: './',
  plugins: [
    react(),
    {
      name: 'edge-tts-server',
      configureServer(server) {
        server.middlewares.use('/api/tts', async (req, res) => {
          try {
            const url = new URL(req.url, 'http://localhost');
            const text = url.searchParams.get('text');

            if (!text) {
              res.statusCode = 400;
              res.end('Missing text parameter');
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

            // Check cache for instant playback
            if (ttsCache.has(cacheKey)) {
              const cachedBuffer = ttsCache.get(cacheKey);
              res.writeHead(200, {
                'Content-Type': 'audio/mpeg',
                'Content-Length': cachedBuffer.length,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=86400'
              });
              res.end(cachedBuffer);
              return;
            }

            // Ưu tiên 1: Pure Node.js WebSocket Edge-TTS (độ trễ siêu thấp ~600ms, không phụ thuộc file tạm)
            try {
              const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
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
                console.error('MsEdgeTTS stream error:', err);
                if (!res.writableEnded) res.end();
              });

              req.on('close', () => {
                try { tts.close(); } catch (e) {}
              });
              return;
            } catch (wsErr) {
              console.warn('MsEdgeTTS WebSocket failed, fallback to standalone edge-tts.exe:', wsErr.message);
            }

            // Ưu tiên 2: Standalone edge-tts.exe dự phòng
            const tempFile = path.join(os.tmpdir(), `tts_${Date.now()}_${Math.random().toString(36).slice(2)}.txt`);
            fs.writeFileSync(tempFile, cleanText, 'utf8');

            const chunks = [];
            let processClosed = false;

            const cleanupTemp = () => {
              try {
                if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
              } catch (e) {}
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

            const ttsProcess = spawn(exeCmd, exeArgs, { windowsHide: true });

            ttsProcess.stdout.on('data', (chunk) => {
              chunks.push(chunk);
              if (!res.writableEnded) {
                res.write(chunk);
              }
            });

            ttsProcess.stderr.on('data', (chunk) => {
              console.error('Edge-TTS stderr:', chunk.toString());
            });

            ttsProcess.on('close', (code) => {
              processClosed = true;
              cleanupTemp();

              if (code === 0 && chunks.length > 0) {
                const audioBuffer = Buffer.concat(chunks);
                ttsCache.set(cacheKey, audioBuffer);
                if (!res.writableEnded) {
                  res.end();
                }
              } else {
                console.error('Edge-TTS exited with code', code);
                if (!res.writableEnded) {
                  res.end();
                }
              }
            });

            ttsProcess.on('error', (err) => {
              console.error('Edge-TTS spawn error:', err.message);
              cleanupTemp();
              if (!processClosed && !res.writableEnded) {
                processClosed = true;
                res.end();
              }
            });

            req.on('close', () => {
              cleanupTemp();
              if (!processClosed) {
                try { ttsProcess.kill(); } catch (e) {}
              }
            });

            // Timeout safety: if edge-tts takes > 12s
            setTimeout(() => {
              if (!processClosed) {
                processClosed = true;
                cleanupTemp();
                try { ttsProcess.kill(); } catch (e) {}
                if (!res.writableEnded) {
                  res.end();
                }
              }
            }, 12000);

          } catch (e) {
            console.error('TTS middleware error:', e);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.end('TTS Error');
            }
          }
        });

        // 2. Kích hoạt trực tiếp phần mềm Microsoft PowerPoint (POWERPNT.EXE) trên máy tính
        server.middlewares.use('/api/open-powerpoint', async (req, res) => {
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
        });
      }
    }
  ],
  server: {
    port: 3000,
    open: false,
    host: true
  }
});
