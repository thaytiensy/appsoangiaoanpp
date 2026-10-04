export interface WebMMuxerOptions {
  width: number;
  height: number;
  codec?: 'V_VP8' | 'V_VP9';
  durationSeconds: number;
}

export interface EncodedChunkInfo {
  data: Uint8Array;
  timestampMicros: number;
  isKeyframe: boolean;
}

function writeVint(value: number): Uint8Array {
  if (value < 0x7f) {
    return new Uint8Array([value | 0x80]);
  }
  if (value < 0x3fff) {
    return new Uint8Array([(value >> 8) | 0x40, value & 0xff]);
  }
  if (value < 0x1fffff) {
    return new Uint8Array([(value >> 16) | 0x20, (value >> 8) & 0xff, value & 0xff]);
  }
  return new Uint8Array([
    (value >> 24) | 0x10,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  ]);
}

function writeUint(value: number, bytes: number): Uint8Array {
  const buf = new Uint8Array(bytes);
  for (let i = bytes - 1; i >= 0; i--) {
    buf[i] = value & 0xff;
    value = value >>> 8;
  }
  return buf;
}

function writeString(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

function writeFloat32(val: number): Uint8Array {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setFloat32(0, val, false);
  return new Uint8Array(buf);
}

function createEbmlElement(id: number[], payload: Uint8Array): Uint8Array {
  const idBytes = new Uint8Array(id);
  const sizeBytes = writeVint(payload.length);
  const result = new Uint8Array(idBytes.length + sizeBytes.length + payload.length);
  result.set(idBytes, 0);
  result.set(sizeBytes, idBytes.length);
  result.set(payload, idBytes.length + sizeBytes.length);
  return result;
}

function concatBuffers(buffers: Uint8Array[]): Uint8Array {
  const totalLength = buffers.reduce((acc, b) => acc + b.length, 0);
  const out = new Uint8Array(totalLength);
  let offset = 0;
  for (const b of buffers) {
    out.set(b, offset);
    offset += b.length;
  }
  return out;
}

export class WebMMuxer {
  private width: number;
  private height: number;
  private codec: string;
  private durationSeconds: number;
  private chunks: EncodedChunkInfo[] = [];

  constructor(options: WebMMuxerOptions) {
    this.width = options.width;
    this.height = options.height;
    this.codec = options.codec || 'V_VP8';
    this.durationSeconds = Math.max(0.1, options.durationSeconds);
  }

  public addVideoChunk(data: Uint8Array, timestampMicros: number, isKeyframe: boolean): void {
    this.chunks.push({ data, timestampMicros, isKeyframe });
  }

  public finalize(): Uint8Array {
    // 1. EBML Header
    const ebmlHeader = createEbmlElement(
      [0x1a, 0x45, 0xdf, 0xa3], // EBML
      concatBuffers([
        createEbmlElement([0x42, 0x86], writeUint(1, 1)), // EBMLVersion
        createEbmlElement([0x42, 0xf7], writeUint(1, 1)), // EBMLReadVersion
        createEbmlElement([0x42, 0xf2], writeUint(4, 1)), // EBMLMaxIDLength
        createEbmlElement([0x42, 0xf3], writeUint(8, 1)), // EBMLMaxSizeLength
        createEbmlElement([0x42, 0x82], writeString('webm')), // DocType
        createEbmlElement([0x42, 0x87], writeUint(2, 1)), // DocTypeVersion
        createEbmlElement([0x42, 0x85], writeUint(2, 1)), // DocTypeReadVersion
      ])
    );

    // 2. Segment Info
    const durationMs = this.durationSeconds * 1000;
    const segmentInfo = createEbmlElement(
      [0x15, 0x49, 0xa9, 0x66], // Info
      concatBuffers([
        createEbmlElement([0x2a, 0xd7, 0xb1], writeUint(1000000, 4)), // TimecodeScale = 1ms
        createEbmlElement([0x4d, 0x80], writeString('Antigravity Muxer')), // MuxingApp
        createEbmlElement([0x57, 0x41], writeString('Antigravity Engine')), // WritingApp
        createEbmlElement([0x44, 0x89], writeFloat32(durationMs)), // Duration in ms
      ])
    );

    // 3. Tracks (Track 1 = Video)
    const videoTrack = createEbmlElement(
      [0xae], // TrackEntry
      concatBuffers([
        createEbmlElement([0xd7], writeUint(1, 1)), // TrackNumber: 1
        createEbmlElement([0x73, 0xc5], writeUint(1, 1)), // TrackUID: 1
        createEbmlElement([0x83], writeUint(1, 1)), // TrackType: 1 (Video)
        createEbmlElement([0x86], writeString(this.codec)), // CodecID
        createEbmlElement(
          [0xe0], // VideoSettings
          concatBuffers([
            createEbmlElement([0xb0], writeUint(this.width, 2)), // PixelWidth
            createEbmlElement([0xba], writeUint(this.height, 2)), // PixelHeight
          ])
        ),
      ])
    );

    const tracksElement = createEbmlElement([0x16, 0x54, 0xae, 0x6b], videoTrack);

    // 4. Clusters & SimpleBlocks
    const clusters: Uint8Array[] = [];
    if (this.chunks.length > 0) {
      const clusterTimecodeMs = Math.floor(this.chunks[0].timestampMicros / 1000);
      const simpleBlocks: Uint8Array[] = [];

      for (const chunk of this.chunks) {
        const chunkTimeMs = Math.floor(chunk.timestampMicros / 1000);
        const relTimecode = chunkTimeMs - clusterTimecodeMs;

        // SimpleBlock structure:
        // - Track Number: 0x81 (VINT 1)
        // - Timecode: int16 (2 bytes big endian)
        // - Flags: 0x80 for Keyframe, 0x00 for non-keyframe
        // - Payload data
        const header = new Uint8Array(4);
        header[0] = 0x81;
        header[1] = (relTimecode >> 8) & 0xff;
        header[2] = relTimecode & 0xff;
        header[3] = chunk.isKeyframe ? 0x80 : 0x00;

        const blockPayload = concatBuffers([header, chunk.data]);
        simpleBlocks.push(createEbmlElement([0xa3], blockPayload));
      }

      const clusterPayload = concatBuffers([
        createEbmlElement([0xe7], writeUint(clusterTimecodeMs, 4)), // Cluster Timecode
        ...simpleBlocks,
      ]);

      clusters.push(createEbmlElement([0x1f, 0x43, 0xb6, 0x75], clusterPayload));
    }

    // 5. Segment Master Element
    const segmentPayload = concatBuffers([segmentInfo, tracksElement, ...clusters]);
    const segmentElement = createEbmlElement([0x18, 0x53, 0x80, 0x67], segmentPayload);

    return concatBuffers([ebmlHeader, segmentElement]);
  }
}
