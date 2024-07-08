import { Option } from "./option";
import { ProjectionBuilder } from "./projection_builder";
import { Snapshot, VersionFromTo } from "./snapshot";

export class EventStream<TEvent, KSnapshot> {
  private _changes: TEvent[] = [];
  constructor(
    private _history: TEvent[],
    private readonly snapshotV2?: Snapshot<
      KSnapshot & { version: number },
      TEvent,
      TEvent
    >,
    readonly flushHistoryOnSnapshot?: boolean
  ) {}

  addHistory(history: TEvent[]) {
    this._history = [...this._history, ...history];
  }

  fillWithSnapshot(snapshot: KSnapshot & { version: number }) {
    this.snapshotV2?.fillWithSnapshot(snapshot);
  }

  getSnapshots(version?: VersionFromTo) {
    return this.snapshotV2?.getSnapshots(version) || [];
  }

  getSnapshotChanges() {
    return this.snapshotV2?.getChanges() || [];
  }

  getLastSnapshot(): Option<KSnapshot> {
    return this.snapshotV2?.getChanges().slice(-1)[0] || null;
  }

  getEventsChanges(): TEvent[] {
    return this._changes;
  }

  getHistory(): TEvent[] {
    return this._history;
  }

  addEvent(event: TEvent) {
    this._history.push(event);
    this._changes.push(event);

    const snapshot = this.snapshotV2?.createSnapshot(
      this._history,
      this._changes
    );

    if (this.flushHistoryOnSnapshot && snapshot) {
      this._history = [];
      this._changes = [];
      this.snapshotV2?.emptySnapshotChangesButNotLast();
      this.snapshotV2?.emptySnapshotsButNotLast();
    }

    return snapshot;
  }

  project<P>(projectionBuilder: ProjectionBuilder<TEvent, KSnapshot, P>) {
    return projectionBuilder.execute(
      this._history,
      this._changes,
      this.snapshotV2?.getSnapshots() || [],
      this.snapshotV2?.getChanges() || []
    );
  }
}
