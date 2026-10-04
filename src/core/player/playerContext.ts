import { AudioMixer } from './AudioMixer';
import { PreviewEngine } from './PreviewEngine';

let audioMixerInstance: AudioMixer | null = null;
let previewEngineInstance: PreviewEngine | null = null;

export function getAudioMixer(): AudioMixer {
  if (!audioMixerInstance) {
    audioMixerInstance = new AudioMixer();
  }
  return audioMixerInstance;
}

export function getPreviewEngine(): PreviewEngine {
  if (!previewEngineInstance) {
    previewEngineInstance = new PreviewEngine(getAudioMixer());
  }
  return previewEngineInstance;
}
