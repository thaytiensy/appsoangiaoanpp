import { TimelineState, HistoryState } from '@/types/timeline';
import { Command } from './Command';

export class HistoryManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];
  private readonly maxHistory: number;

  constructor(maxHistory = 50) {
    this.maxHistory = Math.max(1, maxHistory);
  }

  execute(command: Command, state: TimelineState): TimelineState {
    const nextState = command.execute(state);
    this.undoStack.push(command);

    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    this.redoStack = [];
    return nextState;
  }

  undo(state: TimelineState): TimelineState | null {
    const command = this.undoStack.pop();
    if (!command) return null;

    const revertedState = command.undo(state);
    this.redoStack.push(command);
    return revertedState;
  }

  redo(state: TimelineState): TimelineState | null {
    const command = this.redoStack.pop();
    if (!command) return null;

    const reappliedState = command.execute(state);
    this.undoStack.push(command);
    return reappliedState;
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }

  getHistoryState(): HistoryState {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
    };
  }
}
