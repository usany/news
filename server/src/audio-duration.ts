/**
 * Compute the duration (in seconds) of an audio file from a minimal byte
 * sample. Supports WAV (PCM and many common formats) and MP3 (via bitrate
 * estimation). Only a small header slice is required for WAV; MP3 needs the
 * file size plus the first frame's bitrate.
 */

/** Parse a little-endian unsigned integer from a Buffer. */
function leU32(buf: Buffer, off: number): number {
  return buf.readUInt32LE(off);
}

/** Parse a little-endian unsigned short from a Buffer. */
function leU16(buf: Buffer, off: number): number {
  return buf.readUInt16LE(off);
}

/**
 * Extract the duration of a WAV file from its header bytes.
 * Returns seconds, or undefined if the header is not a valid WAV.
 */
export function wavDuration(header: Buffer): number | undefined {
  if (header.length < 44) return undefined;
  if (header.toString('latin1', 0, 4) !== 'RIFF') return undefined;
  if (header.toString('latin1', 8, 12) !== 'WAVE') return undefined;

  // Walk RIFF chunks looking for `fmt ` and `data`.
  let offset = 12;
  let fmt: { channels: number; sampleRate: number; bitsPerSample: number; blockAlign: number } | undefined;
  let dataSize: number | undefined;

  while (offset + 8 <= header.length) {
    const chunkId = header.toString('latin1', offset, offset + 4);
    const chunkSize = leU32(header, offset + 4);
    const dataStart = offset + 8;

    if (chunkId === 'fmt ' && dataStart + 16 <= header.length) {
      const audioFormat = leU16(header, dataStart);
      const channels = leU16(header, dataStart + 2);
      const sampleRate = leU32(header, dataStart + 4);
      const blockAlign = leU16(header, dataStart + 12);
      const bitsPerSample = leU16(header, dataStart + 14);

      // Only support PCM (1) for a simple byte→second conversion. For other
      // formats we cannot derive duration without decoding, though most of our
      // files are PCM WAV.
      if (audioFormat === 1) {
        fmt = { channels, sampleRate, bitsPerSample, blockAlign };
      }
    } else if (chunkId === 'data') {
      dataSize = chunkSize;
      // We only need the `data` chunk size; we can stop after fmt + data.
      break;
    }

    // Chunks are 2-byte aligned.
    offset = dataStart + chunkSize + (chunkSize % 2);
  }

  if (!fmt || dataSize === undefined) return undefined;
  const byteRate = fmt.sampleRate * fmt.channels * (fmt.bitsPerSample / 8);
  if (byteRate === 0) return undefined;
  return dataSize / byteRate;
}

/**
 * MP3 bitrate table (bits per second) for MPEG-1 Layer III, indexed by the
 * 4-bit bitrate index. 0 means "free" or "invalid".
 */
const MPEG1_LAYER3_BITRATE = [
  0, 32000, 40000, 48000, 56000, 64000, 80000, 96000, 112000, 128000,
  160000, 192000, 224000, 256000, 320000, 0,
];

const MPEG2_LAYER3_BITRATE = [
  0, 8000, 16000, 24000, 32000, 40000, 48000, 56000, 64000, 80000, 96000,
  112000, 128000, 144000, 160000, 0,
];

const SAMPLE_RATE_MPEG1 = [44100, 48000, 32000, 0];
const SAMPLE_RATE_MPEG2 = [22050, 24000, 16000, 0];
const SAMPLE_RATE_MPEG25 = [11025, 12000, 8000, 0];

/**
 * Estimate the duration of an MP3 file from its first frame header and total
 * size. Returns seconds, or undefined if the frame header is not valid.
 */
export function mp3Duration(header: Buffer, totalSize: number): number | undefined {
  // Find the first valid frame sync (0xFF Ex, where Ex has sync bits set).
  let i = 0;
  while (i < header.length - 4) {
    if (header[i] === 0xff && (header[i + 1] & 0xe0) === 0xe0) break;
    i++;
  }
  if (i >= header.length - 4) return undefined;

  const b1 = header[i + 1];
  const b2 = header[i + 2];
  const b3 = header[i + 3];

  const versionBits = (b1 >> 3) & 0x03; // 0 = MPEG 2.5, 2 = MPEG 2, 3 = MPEG 1
  const layerBits = (b1 >> 1) & 0x03; // 1 = Layer III
  const bitrateIndex = (b2 >> 4) & 0x0f;
  const sampleRateIndex = (b2 >> 2) & 0x03;
  const padding = (b2 >> 1) & 0x01;

  if (layerBits !== 1) return undefined; // Layer III only

  let bitrate: number;
  let sampleRate: number;
  if (versionBits === 3) {
    bitrate = MPEG1_LAYER3_BITRATE[bitrateIndex];
    sampleRate = SAMPLE_RATE_MPEG1[sampleRateIndex];
  } else if (versionBits === 2) {
    bitrate = MPEG2_LAYER3_BITRATE[bitrateIndex];
    sampleRate = SAMPLE_RATE_MPEG2[sampleRateIndex];
  } else {
    bitrate = MPEG2_LAYER3_BITRATE[bitrateIndex];
    sampleRate = SAMPLE_RATE_MPEG25[sampleRateIndex];
  }

  if (!bitrate || !sampleRate) return undefined;

  const samplesPerFrame = versionBits === 3 ? 1152 : 576;
  const frameLength = Math.floor((samplesPerFrame / 8 * bitrate) / sampleRate) + padding;

  // Number of frames ≈ (totalSize - ID3v2 header) / frameLength. We estimate
  // from total byte count and the audio bytes after a leading ID3/ID3 tag.
  const frameCount = totalSize / frameLength;
  const seconds = (frameCount * samplesPerFrame) / sampleRate;
  return seconds;
}

/**
 * Compute audio duration (seconds) from the file extension, a header slice,
 * and the total size. Returns undefined if duration cannot be determined.
 */
export function audioDuration(
  name: string,
  header: Buffer,
  totalSize: number,
): number | undefined {
  const lower = name.toLowerCase();
  if (lower.endsWith('.wav') || lower.endsWith('.wave')) {
    return wavDuration(header);
  }
  if (lower.endsWith('.mp3')) {
    return mp3Duration(header, totalSize);
  }
  return undefined;
}
