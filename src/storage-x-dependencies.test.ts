import { StorageXDependencies } from './storage-x-dependencies';

// We have to define a test class because the StorageXDependencies is abstract.
class StorageXTest extends StorageXDependencies<WindowLocalStorage> {
  constructor() {
    super();
  }

  get dependenciesValue() {
    return this.dependencies;
  }
}

describe('StorageXDependencies', (): void => {
  let storageXDependenciesTest: StorageXTest;

  beforeEach((): void => {
    storageXDependenciesTest = new StorageXTest();
  });

  it('should be created', (): void => {
    expect(storageXDependenciesTest).toBeTruthy();
  });

  it('should be get dependencies', (): void => {
    expect(storageXDependenciesTest.dependenciesValue).toEqual(window);
  });
});
