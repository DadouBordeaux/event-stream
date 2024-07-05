export interface ProjectionBuilder<E, S, P> {
  execute(
    history: E[],
    historyChanges: E[],
    snapshots: S[],
    snapshotChanges: S[]
  ): P;
}
