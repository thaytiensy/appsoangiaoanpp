export function formatTimecode(seconds: number, fps = 30): string {
  const safeSeconds = Math.max(0, isFinite(seconds) ? seconds : 0);
  const totalFrames = Math.floor(safeSeconds * fps);

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = Math.floor(safeSeconds % 60);
  const frames = totalFrames % fps;

  const pad = (n: number, z = 2) => String(n).padStart(z, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}:${pad(frames)}`;
}

export function formatCompactTime(seconds: number): string {
  const safeSeconds = Math.max(0, isFinite(seconds) ? seconds : 0);
  const minutes = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  const ms = Math.floor((safeSeconds % 1) * 10);

  const pad = (n: number) => String(n).padStart(2, '0');
  if (minutes > 0) {
    return `${pad(minutes)}:${pad(secs)}`;
  }
  return `${secs}.${ms}s`;
}

export function parseTimecode(timecode: string, fps = 30): number {
  const parts = timecode.split(':').map((p) => parseInt(p, 10));
  if (parts.length === 4) {
    const [h, m, s, f] = parts;
    return h * 3600 + m * 60 + s + (f || 0) / fps;
  }
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  }
  const val = parseFloat(timecode);
  return isNaN(val) ? 0 : val;
}
