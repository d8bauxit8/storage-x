/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function */
import {
  StorageXEvent,
  StorageXEventController,
  StorageXEventHandler,
} from '../src/storage-x-event-controller';
import { StorageTypes } from '../src/storage-x';

interface Test {
  __UTestKey__: unknown;
  __UTestKeyDummy__: unknown;
}

describe('StorageXEventController', (): void => {
  const onStorage: WindowEventHandlers['onstorage'] = window.onstorage;
  const setTimeout: WindowOrWorkerGlobalScope['setTimeout'] = window.setTimeout;

  const localStorage: Storage = {} as Storage;
  const testKey = '__UTestKey__';

  const testHandler: StorageXEventHandler<'__UTestKey__', unknown> = (
    _: StorageXEvent<'__UTestKey__', unknown>
  ): void => {};
  const dummyTestHandler: StorageXEventHandler<
    '__UTestKey__' | '__UTestKeyDummy__',
    unknown
  > = (
    _: StorageXEvent<'__UTestKey__' | '__UTestKeyDummy__', unknown>
  ): void => {};

  let storageXEventController: StorageXEventController<Test>;

  const initStorageXEventController = (): void => {
    storageXEventController = new StorageXEventController<Test>(
      StorageTypes.LOCAL,
      localStorage
    );
  };

  it('should be created', (): void => {
    initStorageXEventController();
    expect(storageXEventController).toBeTruthy();
  });

  describe('should be created when got an error', (): void => {
    it('which is called the storage event unavailable because the onstorage property is not exists in the dependencies', (): void => {
      delete (window as any)['onstorage'];

      expect(() => initStorageXEventController()).toThrowError(
        'The storage event is not available!'
      );

      (window as any)['onstorage'] = onStorage;
    });

    it('which is called the event loop unavailable because the setTimeout property is not exists in the dependencies', (): void => {
      delete (window as any)['setTimeout'];

      expect(() => initStorageXEventController()).toThrowError(
        'The event loop is not available! (setTimeout)'
      );

      (window as any)['setTimeout'] = setTimeout;
    });
  });

  describe('should be checked the key', (): void => {
    beforeEach((): void => {
      initStorageXEventController();
    });

    it('when its not exists yet', (): void => {
      expect(storageXEventController.isKey(testKey)).toBeFalsy();
    });

    it('when its already exists', (): void => {
      storageXEventController.add(testKey, testHandler);

      expect(storageXEventController.isKey(testKey)).toBeTruthy();
    });
  });

  describe('should be checked the handler', (): void => {
    beforeEach((): void => {
      initStorageXEventController();
    });

    it('when the key is not exists yet', (): void => {
      expect(
        storageXEventController.isHandler(testKey, testHandler)
      ).toBeFalsy();
    });

    it('when the key is already exists but the handler was not added', (): void => {
      storageXEventController.add(testKey, dummyTestHandler);

      expect(
        storageXEventController.isHandler(testKey, testHandler)
      ).toBeFalsy();
    });

    it('when the key and the handler is already exists', (): void => {
      storageXEventController.add(testKey, testHandler);

      expect(
        storageXEventController.isHandler(testKey, testHandler)
      ).toBeTruthy();
    });
  });

  describe('should be added one handler', (): void => {
    beforeEach((): void => {
      initStorageXEventController();
    });

    it('when the key is not exists yet', (): void => {
      expect(storageXEventController.isKey(testKey)).toBeFalsy();
      expect(
        storageXEventController.isHandler(testKey, testHandler)
      ).toBeFalsy();

      storageXEventController.add(testKey, testHandler);

      expect(storageXEventController.isKey(testKey)).toBeTruthy();
      expect(
        storageXEventController.isHandler(testKey, testHandler)
      ).toBeTruthy();
    });

    it('when the key is already exists', (): void => {
      storageXEventController.add(testKey, dummyTestHandler);

      expect(storageXEventController.isKey(testKey)).toBeTruthy();
      expect(
        storageXEventController.isHandler(testKey, dummyTestHandler)
      ).toBeTruthy();
      expect(
        storageXEventController.isHandler(testKey, testHandler)
      ).toBeFalsy();

      storageXEventController.add(testKey, testHandler);

      expect(storageXEventController.isKey(testKey)).toBeTruthy();
      expect(
        storageXEventController.isHandler(testKey, testHandler)
      ).toBeTruthy();
    });
  });

  describe('should be removed one handler', (): void => {
    beforeEach((): void => {
      initStorageXEventController();
    });

    it('when its not exists in the key', (): void => {
      storageXEventController.add(testKey, dummyTestHandler);

      expect(
        storageXEventController.isHandler(testKey, testHandler)
      ).toBeFalsy();
      expect(
        storageXEventController.isHandler(testKey, dummyTestHandler)
      ).toBeTruthy();

      storageXEventController.remove(testKey, testHandler);

      expect(storageXEventController.isKey(testKey)).toBeTruthy();
      expect(
        storageXEventController.isHandler(testKey, dummyTestHandler)
      ).toBeTruthy();
    });

    it('when its exists in the key', (): void => {
      storageXEventController.add(testKey, dummyTestHandler);
      storageXEventController.add(testKey, testHandler);

      expect(
        storageXEventController.isHandler(testKey, testHandler)
      ).toBeTruthy();
      expect(
        storageXEventController.isHandler(testKey, dummyTestHandler)
      ).toBeTruthy();

      storageXEventController.remove(testKey, testHandler);

      expect(storageXEventController.isKey(testKey)).toBeTruthy();
      expect(
        storageXEventController.isHandler(testKey, dummyTestHandler)
      ).toBeTruthy();
    });
  });

  describe('should be removed all handler in key', (): void => {
    const testKeyDummy = '__UTestKeyDummy__';

    beforeEach((): void => {
      initStorageXEventController();
    });

    it('when the key does not contain any items', (): void => {
      storageXEventController.add(testKeyDummy, dummyTestHandler);

      expect(storageXEventController.isKey(testKey)).toBeFalsy();
      expect(
        storageXEventController.isHandler(testKeyDummy, dummyTestHandler)
      ).toBeTruthy();

      storageXEventController.removeAllInKey(testKey);

      expect(storageXEventController.isKey(testKey)).toBeFalsy();
      expect(
        storageXEventController.isHandler(testKeyDummy, dummyTestHandler)
      ).toBeTruthy();
    });

    it('when the key contains one item', (): void => {
      storageXEventController.add(testKeyDummy, dummyTestHandler);
      storageXEventController.add(testKey, testHandler);

      expect(
        storageXEventController.isHandler(testKey, testHandler)
      ).toBeTruthy();
      expect(
        storageXEventController.isHandler(testKeyDummy, dummyTestHandler)
      ).toBeTruthy();

      storageXEventController.removeAllInKey(testKey);

      expect(storageXEventController.isKey(testKey)).toBeFalsy();
      expect(
        storageXEventController.isHandler(testKeyDummy, dummyTestHandler)
      ).toBeTruthy();
    });

    it('when the key contains more items', (): void => {
      storageXEventController.add(testKeyDummy, dummyTestHandler);
      storageXEventController.add(testKey, testHandler);
      storageXEventController.add(testKey, dummyTestHandler);

      expect(
        storageXEventController.isHandler(testKey, testHandler)
      ).toBeTruthy();
      expect(
        storageXEventController.isHandler(testKey, dummyTestHandler)
      ).toBeTruthy();
      expect(
        storageXEventController.isHandler(testKey, dummyTestHandler)
      ).toBeTruthy();

      storageXEventController.removeAllInKey(testKey);

      expect(storageXEventController.isKey(testKey)).toBeFalsy();
      expect(
        storageXEventController.isHandler(testKeyDummy, dummyTestHandler)
      ).toBeTruthy();
    });
  });
});
