'use client';

import React, { useState } from 'react';
import { AspectRatio } from '@/types/preview';
import { VideoCanvas } from './VideoCanvas';
import { PlaybackControls } from './PlaybackControls';

export function StudioPreviewPlayer() {
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

  return (
    <div className="w-full flex flex-col bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      <VideoCanvas aspectRatio={aspectRatio} />
      <PlaybackControls
        currentAspectRatio={aspectRatio}
        onAspectRatioChange={setAspectRatio}
      />
    </div>
  );
}
