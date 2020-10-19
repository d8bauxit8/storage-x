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

class StorageXTestWhenThereIsNoWindow extends StorageXTest {
  protected get dependencies(): WindowLocalStorage {
    // Its needed to test the constructor error
    // @ts-ignore
    return null;
  }
}

describe('StorageXDependencies', (): void => {
  let storageXDependenciesTest: StorageXTest;

  describe('when there is window', (): void => {
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

  describe('when there is no window', (): void => {
    it('should be created', (): void => {
      expect(() => new StorageXTestWhenThereIsNoWindow()).toThrowError(
        'The window is not available!'
      );
    });
  });
});
