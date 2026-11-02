// ART AI: Dual Teacher Voice Engine (Thầy Cọ Nhí - vi-VN-NamMinhNeural & Cô Hoài My - vi-VN-HoaiMyNeural)
// Standard: GDPT 2018 Microsoft Edge Neural Vietnamese TTS with multi-host failover,
// direct Google Vietnamese TTS secondary fallback, and pitch-shifted WebSpeech safety net.

class TeacherSpeechService {
  constructor() {
    this.audioPlayer = null;
    this.isSpeaking = false;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.pendingText = null;
    this.pendingCallbacks = null;
    this.currentSessionId = 0;
    // Khởi tạo giọng nói theo cài đặt đã lưu trong localStorage ('male' | 'female')
    const savedTeacher = typeof localStorage !== 'undefined' ? localStorage.getItem('ARTED_SELECTED_TEACHER') : null;
    this.activeVoice = savedTeacher === 'female' ? 'female' : 'male';

    // Listen for user interaction channel to unlock browser autoplay
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        if (this.pendingText) {
          const text = this.pendingText;
          const { onStart, onEnd, voice } = this.pendingCallbacks || {};
          this.pendingText = null;
          this.pendingCallbacks = null;
          this.speak(text, onStart, onEnd, voice);
        }
      };

      ['click', 'touchstart', 'keydown', 'wheel', 'pointerdown'].forEach((evt) => {
        window.addEventListener(evt, unlockAudio, { passive: true });
      });
    }
  }

  setVoice(voice) {
    this.activeVoice = (voice === 'female' || voice === 'vi-VN-HoaiMyNeural') ? 'female' : 'male';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('ARTED_SELECTED_TEACHER', this.activeVoice);
    }
  }

  getVoice() {
    return this.activeVoice;
  }

  stop() {
    this.currentSessionId++;

    if (this.audioPlayer) {
      try {
        this.audioPlayer.pause();
        this.audioPlayer.removeAttribute('src');
        this.audioPlayer.load();
      } catch (e) {}
      this.audioPlayer = null;
    }

    if (this.synth && this.synth.speaking) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }

    this.isSpeaking = false;
  }

  // Generate prioritized list of audio endpoints for zero-latency, highly available playback
  getTtsCandidateUrls(cleanText, voice = this.activeVoice) {
    const encoded = encodeURIComponent(cleanText);
    const urls = [];

    const isClient = typeof window !== 'undefined';
    const isGithubPages = isClient && window.location.hostname.includes('github.io');

    // 1. Same-origin relative path (Instant on localhost:3000 and artaimythuat.vercel.app)
    if (!isGithubPages) {
      urls.push(`/api/tts?text=${encoded}&voice=${voice}`);
    }

    // 2. Global Vercel production serverless gateway (artaimythuat.vercel.app with CORS)
    urls.push(`https://artaimythuat.vercel.app/api/tts?text=${encoded}&voice=${voice}`);

    // 3. Fallback: CHỈ KHI voice === 'female', mới dùng Google Vietnamese TTS (vì Google TTS là giọng NỮ)
    // TUYỆT ĐỐI KHÔNG dùng Google TTS khi voice === 'male' để tránh bị đổi sang giọng nữ!
    if (voice === 'female') {
      const firstSentence = cleanText.split(/[.!?]\s+/)[0] || cleanText;
      const googleText = firstSentence.slice(0, 180).trim();
      urls.push(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(googleText)}&tl=vi&client=tw-ob`);
    }

    // Deduplicate
    return [...new Set(urls)];
  }

  // Preload audio into server RAM cache without playing
  preload(text, voice = this.activeVoice) {
    if (!text) return;
    const cleanText = text
      .replace(/[#*_`~-]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/https?:\/\/\S+/g, '')
      .slice(0, 500)
      .trim();
    if (!cleanText) return;

    const urls = this.getTtsCandidateUrls(cleanText, voice);
    if (typeof fetch !== 'undefined' && urls[0]) {
      fetch(urls[0], { mode: 'cors' }).catch(() => {});
    }
  }

  speak(text, onStart, onEnd, voiceOverride = null) {
    this.stop();

    const cleanText = (text || '')
      .replace(/[#*_`~-]/g, '')
      .replace(/\n+/g, '. ')
      .replace(/https?:\/\/\S+/g, '')
      .slice(0, 600)
      .trim();

    if (!cleanText) return;

    const voice = voiceOverride || this.activeVoice || 'male';
    const activeSession = this.currentSessionId;
    const candidateUrls = this.getTtsCandidateUrls(cleanText, voice);
    let urlIndex = 0;

    const tryNextAudio = () => {
      if (this.currentSessionId !== activeSession) return;

      if (urlIndex >= candidateUrls.length) {
        // All network endpoints failed, smoothly fallback to WebSpeech
        this.audioPlayer = null;
        this.fallbackWebSpeech(cleanText, onStart, onEnd, activeSession, voice);
        return;
      }

      const currentUrl = candidateUrls[urlIndex++];
      const audio = new Audio();
      this.audioPlayer = audio;
      audio.crossOrigin = 'anonymous';
      audio.preload = 'auto';

      let hasStarted = false;

      audio.onplay = () => {
        if (this.currentSessionId !== activeSession) {
          try { audio.pause(); } catch (e) {}
          return;
        }
        hasStarted = true;
        this.isSpeaking = true;
        if (onStart) onStart();
      };

      audio.onended = () => {
        if (this.currentSessionId !== activeSession) return;
        this.isSpeaking = false;
        this.audioPlayer = null;
        if (onEnd) onEnd();
      };

      audio.onerror = () => {
        if (this.currentSessionId !== activeSession) return;
        if (!hasStarted) {
          tryNextAudio();
        } else {
          this.isSpeaking = false;
          this.audioPlayer = null;
          if (onEnd) onEnd();
        }
      };

      audio.src = currentUrl;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          if (this.currentSessionId !== activeSession) return;
          if (err.name === 'NotAllowedError') {
            this.pendingText = cleanText;
            this.pendingCallbacks = { onStart, onEnd, voice };
            return;
          }
          if (!hasStarted) {
            tryNextAudio();
          }
        });
      }
    };

    tryNextAudio();
  }

  // Safety Net 3: Browser WebSpeech API fallback
  fallbackWebSpeech(cleanText, onStart, onEnd, session, voice = 'male') {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    const doSpeak = () => {
      if (session !== undefined && this.currentSessionId !== session) return;

      const voices = this.synth.getVoices();
      const viVoices = voices.filter((v) => {
        const lang = (v.lang || '').toLowerCase();
        return lang.includes('vi') || lang.includes('vie');
      });

      let selectedVoice = null;
      let pitch = 0.9;
      let rate = 0.95;

      if (voice === 'female') {
        selectedVoice = viVoices.find((v) => {
          const name = v.name.toLowerCase();
          return /(hoaimy|mai|linh|chi|nu|female|woman|girl|an\b)/i.test(name);
        }) || viVoices[0];
        pitch = 1.15;
        rate = 0.98;
      } else {
        selectedVoice = viVoices.find((v) => {
          const name = v.name.toLowerCase();
          const isFemale = /(hoaimy|mai|linh|chi|nu|female|woman|girl|an\b)/i.test(name);
          if (isFemale) return false;
          return name.includes('namminh') || /\b(nam|male)\b/i.test(name.replace(/vietnam/gi, ''));
        }) || viVoices[0];
        // Hạ pitch xuống 0.72 để tạo âm sắc nam trầm ấm dứt khoát của Thầy giáo
        pitch = 0.72;
        rate = 0.90;
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.lang = 'vi-VN';
      utterance.pitch = pitch;
      utterance.rate = rate;

      utterance.onstart = () => {
        if (session !== undefined && this.currentSessionId !== session) {
          try { this.synth.cancel(); } catch (e) {}
          return;
        }
        this.isSpeaking = true;
        if (onStart) onStart();
      };

      utterance.onend = () => {
        if (session !== undefined && this.currentSessionId !== session) return;
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = () => {
        if (session !== undefined && this.currentSessionId !== session) return;
        this.isSpeaking = false;
        if (onEnd) onEnd();
      };

      this.synth.speak(utterance);
    };

    if (this.synth.getVoices().length === 0) {
      this.synth.onvoiceschanged = () => {
        doSpeak();
      };
      setTimeout(doSpeak, 250);
    } else {
      doSpeak();
    }
  }
}

export const ttsService = new TeacherSpeechService();
