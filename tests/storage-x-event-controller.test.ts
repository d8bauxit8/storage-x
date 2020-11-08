/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function */
import {
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

  const testHandler: StorageXEventHandler<'__UTestKey__', unknown> = jest.fn();
  const dummyTestHandler: StorageXEventHandler<
    '__UTestKey__' | '__UTestKeyDummy__',
    unknown
  > = jest.fn();

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

  describe('should be called storage event', (): void => {
    let eventHandler: (storageEvent: StorageEvent) => void;
    let setTimeoutSpy: jest.SpyInstance<
      WindowOrWorkerGlobalScope['setTimeout']
    >;

    beforeEach((): void => {
      const addEventListenerSpy = jest.spyOn(window as any, 'addEventListener');
      setTimeoutSpy = jest.spyOn(window as any, 'setTimeout');

      initStorageXEventController();

      eventHandler = addEventListenerSpy.mock.calls[0][1] as (
        storageEvent: StorageEvent
      ) => void;
    });

    const createStorageEvent = (
      storageEvent?: Partial<StorageEvent>
    ): StorageEvent => {
      return { ...storageEvent } as StorageEvent;
    };

    it('when the storage event is not contain storageArea property', (): void => {
      eventHandler(createStorageEvent());

      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    it("when the storage event's storageArea property does not equal the given storage", (): void => {
      eventHandler(createStorageEvent({ storageArea: {} as Storage }));

      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    it('when there is no event handlers', (): void => {
      eventHandler(
        createStorageEvent({ storageArea: localStorage, key: testKey })
      );

      expect(setTimeoutSpy).not.toHaveBeenCalled();
    });

    describe('when there is one event handler', (): void => {
      beforeEach((): void => {
        storageXEventController.add(testKey, testHandler);
      });

      it("and the storageEvent's new and old value are StorageXItem", (): void => {
        const newValue = { item: 'new' };
        const oldValue = { item: 'old' };

        eventHandler(
          createStorageEvent({
            storageArea: localStorage,
            key: testKey,
            newValue: JSON.stringify(newValue),
            oldValue: JSON.stringify(oldValue),
          })
        );

        expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

        // Get the given handler
        const setTimeoutHandler = setTimeoutSpy.mock.calls[0][0];
        setTimeoutHandler();

        expect(testHandler).toHaveBeenCalledTimes(1);
        expect(testHandler).toHaveBeenCalledWith({
          key: testKey,
          oldValue: oldValue.item,
          newValue: newValue.item,
          type: StorageTypes.LOCAL,
        });
      });

      it("and the storageEvent's new value is not StorageXItem", (): void => {
        const newValue = 'new';
        const oldValue = { item: 'old' };

        eventHandler(
          createStorageEvent({
            storageArea: localStorage,
            key: testKey,
            newValue,
            oldValue: JSON.stringify(oldValue),
          })
        );

        expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

        // Get the given handler
        const setTimeoutHandler = setTimeoutSpy.mock.calls[0][0];
        setTimeoutHandler();

        expect(testHandler).toHaveBeenCalledTimes(1);
        expect(testHandler).toHaveBeenCalledWith({
          key: testKey,
          oldValue: oldValue.item,
          newValue: undefined,
          type: StorageTypes.LOCAL,
        });
      });

      it("and the storageEvent's new and old value are undefined", (): void => {
        eventHandler(
          createStorageEvent({
            storageArea: localStorage,
            key: testKey,
            newValue: undefined,
            oldValue: undefined,
          })
        );

        expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

        // Get the given handler
        const setTimeoutHandler = setTimeoutSpy.mock.calls[0][0];
        setTimeoutHandler();

        expect(testHandler).toHaveBeenCalledTimes(1);
        expect(testHandler).toHaveBeenCalledWith({
          key: testKey,
          oldValue: undefined,
          newValue: undefined,
          type: StorageTypes.LOCAL,
        });
      });
    });
  });
});
