type StorageXDependencyCollection = WindowLocalStorage &
  WindowOrWorkerGlobalScope &
  WindowSessionStorage;

const DEPENDENCIES: StorageXDependencyCollection =
  window || document.defaultView;

export abstract class StorageXDependencies<
  OtherDependencies extends Partial<StorageXDependencyCollection>
> {
  private readonly _dependencies: OtherDependencies;

  protected constructor() {
    this._dependencies = DEPENDENCIES as OtherDependencies;

    // Check the needed dependencies
    if (!this.dependencies) {
      throw new Error('The window is not available!');
    }
  }

  protected get dependencies(): OtherDependencies {
    return this._dependencies;
  }
}
