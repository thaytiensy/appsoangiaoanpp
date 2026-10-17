import { TimelineState } from '@/types/timeline';

export interface Command {
  readonly id: string;
  readonly name: string;
  execute(state: TimelineState): TimelineState;
  undo(state: TimelineState): TimelineState;
}

export { recalculateDuration } from './commandUtils';
export { AddClipCommand, RemoveClipCommand } from './ClipCommands';
export { MoveClipCommand } from './MoveClipCommand';
export { SplitClipCommand } from './SplitClipCommand';
