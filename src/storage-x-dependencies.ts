type StorageXDependencyCollection<Dependencies> = Exclude<Dependencies, Window>;

const DEPENDENCIES: Window = window || document.defaultView;

export abstract class StorageXDependencies<OtherDependencies> {
  private readonly _dependencies: StorageXDependencyCollection<
    OtherDependencies
  >;
  protected constructor() {
    // @ts-ignore
    this._dependencies = DEPENDENCIES;

    // Check the needed dependencies
    if (!this.dependencies) {
      throw new Error('The window is not available!');
    }
  }

  protected get dependencies(): StorageXDependencyCollection<
    OtherDependencies
  > {
    return this._dependencies;
  }
}
