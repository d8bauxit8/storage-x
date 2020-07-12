import { StorageXEventController } from './storage-x-event';
import { StorageTypes } from './storage-x';

interface Test {
  __UTest__: string;
}

describe('StorageXEventController', (): void => {
  let storageXEventController: StorageXEventController<Test>;
  let localStorage: Storage;

  beforeEach((): void => {
    localStorage = {} as Storage;

    storageXEventController = new StorageXEventController<Test>(
      StorageTypes.LOCAL,
      localStorage
    );
  });

  it('should be created', (): void => {
    expect(storageXEventController).toBeTruthy();
  });
});
