'use client';

import { useEffect } from 'react';
import { useTimelineStore } from '@/store/useTimelineStore';

export function useTimelineHotkeys(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl?.getAttribute('contenteditable') === 'true';

      if (isInput) return;

      const store = useTimelineStore.getState();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // 1. Undo / Redo
      if (isCtrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        store.undo();
        return;
      }

      if (
        (isCtrlOrCmd && e.key.toLowerCase() === 'y') ||
        (isCtrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        store.redo();
        return;
      }

      // 2. Play / Pause
      if (e.code === 'Space') {
        e.preventDefault();
        store.setIsPlaying(!store.isPlaying);
        return;
      }

      // 3. Split Clip at Playhead (S hoặc Ctrl+K)
      if ((e.key.toLowerCase() === 's' && !isCtrlOrCmd) || (isCtrlOrCmd && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        store.splitClipAtPlayhead(store.selectedTrackId || undefined);
        return;
      }

      // 4. Delete Selected Clips
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        store.deleteSelectedClips();
        return;
      }

      // 5. Select All (Ctrl+A) / Deselect All (Escape)
      if (isCtrlOrCmd && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        store.selectAllClips();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        store.deselectAllClips();
        return;
      }

      // 6. Frame Stepping (Left / Right Arrow)
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const step = e.shiftKey ? 1.0 : 1 / store.fps;
        store.setPlayheadTime(store.playheadTime - step);
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const step = e.shiftKey ? 1.0 : 1 / store.fps;
        store.setPlayheadTime(store.playheadTime + step);
        return;
      }

      // 7. Zoom in / Zoom out (+, =, -)
      if (e.key === '=' || e.key === '+') {
        e.preventDefault();
        store.setZoom(store.zoom + 10);
        return;
      }

      if (e.key === '-') {
        e.preventDefault();
        store.setZoom(store.zoom - 10);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
