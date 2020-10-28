type StorageXDependencyCollection = WindowLocalStorage &
  WindowOrWorkerGlobalScope &
  WindowSessionStorage &
  WindowEventHandlers;

const DEPENDENCIES: StorageXDependencyCollection =
  window || document.defaultView;

export abstract class StorageXDependencies<
  OtherDependencyKeys extends keyof StorageXDependencyCollection
> {
  private readonly _dependencies: Pick<
    StorageXDependencyCollection,
    OtherDependencyKeys
  >;

  protected constructor() {
    this._dependencies = DEPENDENCIES;

    // Check the needed dependencies
    if (!this.dependencies) {
      throw new Error('The window is not available!');
    }
  }

  protected get dependencies(): Pick<
    StorageXDependencyCollection,
    OtherDependencyKeys
  > {
    return this._dependencies;
  }
}
