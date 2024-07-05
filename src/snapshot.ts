import { Option } from "./option";

export type VersionFromTo = { from: number; to: number };

export interface ISnapshot<E, S, K> {
  createSnapshot(data: E[], dataChanges: E[]): void;
  getSnapshots(version?: VersionFromTo): K[];
  getChanges(): K[];
}

export interface SnapshotCreator<
  TEvent,
  TEventChanges,
  Snapshot,
  SnapshotChanges,
  SnapshotReturn
> {
  createSnapshot(
    dataOne: TEvent[],
    dataTwo: TEventChanges[],
    history: Snapshot,
    historyChanges: SnapshotChanges
  ): Option<SnapshotReturn>;
}

export class Snapshot<K extends { version: number }, E, S>
  implements ISnapshot<E, S, K>
{
  private _snapshots: K[];
  private _changes: K[] = [];

  constructor(
    private readonly snapshotFactory: SnapshotCreator<E, E, K[], K[], K>,
    _snapshots: K[] = []
  ) {
    this._snapshots = _snapshots;
  }

  fillWithSnapshot(snapshot: K) {
    this._snapshots.push(snapshot);
  }

  createSnapshot(data: E[], dataChanges: E[]): Option<K> {
    const snap = this.snapshotFactory.createSnapshot(
      data,
      dataChanges,
      this._snapshots,
      this._changes
    );

    snap && this._changes.push(snap);
    snap && this._snapshots.push(snap);
    return snap;
  }

  getChanges(): K[] {
    return this._changes;
  }

  emptySnapshotChangesButNotLast() {
    this._changes = this._changes.slice(-1);
  }

  emptySnapshotsButNotLast() {
    this._snapshots = this._snapshots.slice(-1);
  }

  getSnapshots(version?: VersionFromTo): K[] {
    if (!version) {
      return this._snapshots.slice(-1);
    }

    const vers = version as VersionFromTo;

    const from = vers.from ?? this._snapshots[0].version;
    const to = vers.to || this._snapshots[this._snapshots.length - 1].version;

    return this._snapshots.slice(from, to);
  }
}
