import React, { useState } from 'react';
import { Clip, Track } from '@/types/timeline';
import { calculateSnapping } from '@/core/timeline/snapping';

interface UseClipDragParams {
  clip: Clip;
  track: Track;
  tracks: Track[];
  zoom: number;
  playheadTime: number;
  isSnappingEnabled: boolean;
  selectClip: (clipId: string, multiSelect?: boolean) => void;
  updateClipPosition: (clipId: string, newStart: number, newTrackId?: string) => void;
  resizeClip: (clipId: string, edge: 'start' | 'end', newTime: number) => void;
  onSnapFeedback?: (activePoint?: number) => void;
}

export function useClipDrag({
  clip,
  track,
  tracks,
  zoom,
  playheadTime,
  isSnappingEnabled,
  selectClip,
  updateClipPosition,
  resizeClip,
  onSnapFeedback,
}: UseClipDragParams) {
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const [trimPreview, setTrimPreview] = useState<{ edge: 'start' | 'end'; time: number } | null>(null);

  const clipDuration = clip.end - clip.start;

  const handleBodyMouseDown = (e: React.MouseEvent) => {
    if (track.locked || e.button !== 0) return;
    e.stopPropagation();
    selectClip(clip.id, e.shiftKey);

    const startX = e.clientX;
    const initialStart = clip.start;
    let finalSnappedStart = initialStart;
    let finalTrackId = track.id;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaPx = moveEvent.clientX - startX;
      const rawStart = Math.max(0, initialStart + deltaPx / zoom);

      if (isSnappingEnabled) {
        const snap = calculateSnapping(rawStart, clipDuration, tracks, playheadTime, zoom, clip.id);
        finalSnappedStart = snap.snappedTime;
        if (onSnapFeedback) onSnapFeedback(snap.activeSnapPoint);
      } else {
        finalSnappedStart = rawStart;
        if (onSnapFeedback) onSnapFeedback(undefined);
      }

      const elUnderMouse = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
      const trackEl = elUnderMouse?.closest('[data-track-id]');
      if (trackEl) {
        const targetId = trackEl.getAttribute('data-track-id');
        const targetTrack = tracks.find((t) => t.id === targetId);
        if (targetTrack && !targetTrack.locked && targetTrack.type === clip.type) {
          finalTrackId = targetTrack.id;
        }
      }

      setDragOffset(finalSnappedStart);
    };

    const onMouseUp = () => {
      setDragOffset(null);
      if (onSnapFeedback) onSnapFeedback(undefined);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      if (finalSnappedStart !== clip.start || finalTrackId !== track.id) {
        updateClipPosition(clip.id, finalSnappedStart, finalTrackId);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleTrimMouseDown = (edge: 'start' | 'end', e: React.MouseEvent) => {
    if (track.locked) return;
    e.stopPropagation();
    selectClip(clip.id);

    const startX = e.clientX;
    const initialTime = edge === 'start' ? clip.start : clip.end;
    let finalTime = initialTime;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaPx = moveEvent.clientX - startX;
      const rawTime = Math.max(0, initialTime + deltaPx / zoom);

      if (isSnappingEnabled) {
        const snap = calculateSnapping(rawTime, 0, tracks, playheadTime, zoom, clip.id);
        finalTime = snap.snappedTime;
        if (onSnapFeedback) onSnapFeedback(snap.activeSnapPoint);
      } else {
        finalTime = rawTime;
        if (onSnapFeedback) onSnapFeedback(undefined);
      }

      setTrimPreview({ edge, time: finalTime });
    };

    const onMouseUp = () => {
      setTrimPreview(null);
      if (onSnapFeedback) onSnapFeedback(undefined);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);

      const isValid = edge === 'start' ? finalTime < clip.end - 0.1 : finalTime > clip.start + 0.1;
      if (isValid) {
        resizeClip(clip.id, edge, finalTime);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return { dragOffset, trimPreview, handleBodyMouseDown, handleTrimMouseDown };
}
