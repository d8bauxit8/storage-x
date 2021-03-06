import { StorageTypes, StorageX, StorageXItem } from '../src/storage-x';
import { StorageXEventController } from '../src/storage-x-event-controller';

interface Test {
  __UTestKey__: unknown;
}

describe('StorageX', (): void => {
  const localStorage: Storage = window.localStorage;
  const testKey = '__UTestKey__';

  let storageX: StorageX<Test>;

  let localStorageSpyObj: Pick<Storage, keyof Storage>;

  beforeEach((): void => {
    delete (window as any)['localStorage'];
    (window as any)['localStorage'] = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      length: 0,
    };
    localStorageSpyObj = window.localStorage;
  });

  it('should be created', (): void => {
    storageX = new StorageX<Test>(StorageTypes.LOCAL);
    expect(storageX).toBeTruthy();
  });

  it('should be created when got an error which is called the JSON unavailable because the JSON or its own two properties is not exists', (): void => {
    const jsonParse: JSON['parse'] = JSON.parse;
    delete (JSON as any)['parse'];

    expect(() => new StorageX<Test>(StorageTypes.LOCAL)).toThrowError(
      'The JSON API is not available!'
    );

    (JSON as any)['parse'] = jsonParse;
  });

  describe('should be created when got a DOMException', (): void => {
    it('with QuotaExceededError name but the setItem was succeeded', (): void => {
      localStorageSpyObj.length = 1;
      localStorageSpyObj.setItem = () => {
        throw new DOMException('Error', 'QuotaExceededError');
      };

      expect(() => new StorageX<Test>(StorageTypes.LOCAL)).not.toThrowError(
        `The ${StorageTypes.LOCAL} storage is not available!`
      );
      expect(localStorageSpyObj.removeItem).not.toHaveBeenCalled();
    });

    it('with QuotaExceededError name but the setItem was failed', (): void => {
      localStorageSpyObj.length = 0;
      localStorageSpyObj.setItem = () => {
        throw new DOMException('Error', 'QuotaExceededError');
      };

      expect(() => new StorageX<Test>(StorageTypes.LOCAL)).toThrowError(
        `The ${StorageTypes.LOCAL} storage is not available!`
      );
      expect(localStorageSpyObj.removeItem).not.toHaveBeenCalled();
    });

    it('with NS_ERROR_DOM_QUOTA_REACHED name but the setItem was succeeded', (): void => {
      localStorageSpyObj.length = 1;
      localStorageSpyObj.setItem = () => {
        throw new DOMException('Error', 'NS_ERROR_DOM_QUOTA_REACHED');
      };

      expect(() => new StorageX<Test>(StorageTypes.LOCAL)).not.toThrowError(
        `The ${StorageTypes.LOCAL} storage is not available!`
      );
      expect(localStorageSpyObj.removeItem).not.toHaveBeenCalled();
    });

    it('with NS_ERROR_DOM_QUOTA_REACHED but the setItem was failed', (): void => {
      localStorageSpyObj.length = 0;
      localStorageSpyObj.setItem = () => {
        throw new DOMException('Error', 'NS_ERROR_DOM_QUOTA_REACHED');
      };

      expect(() => new StorageX<Test>(StorageTypes.LOCAL)).toThrowError(
        `The ${StorageTypes.LOCAL} storage is not available!`
      );
      expect(localStorageSpyObj.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('should be', (): void => {
    describe('set an item', (): void => {
      beforeEach((): void => {
        storageX = new StorageX<Test>(StorageTypes.LOCAL);
        (localStorageSpyObj.setItem as jest.Mock).mockClear();
      });

      describe('without expired property', (): void => {
        it('whose type is primitive', (): void => {
          const testValue = 'test';
          storageX.setItem(testKey, testValue);

          expect(localStorageSpyObj.setItem).toHaveBeenCalledTimes(1);
          expect(localStorageSpyObj.setItem).toHaveBeenCalledWith(
            testKey,
            JSON.stringify({ item: testValue })
          );
        });

        it('whose type is object', (): void => {
          const testValue = {
            testBoolean: true,
            testString: 'test',
          };
          storageX.setItem(testKey, testValue);

          expect(localStorageSpyObj.setItem).toHaveBeenCalledTimes(1);
          expect(localStorageSpyObj.setItem).toHaveBeenCalledWith(
            testKey,
            JSON.stringify({ item: testValue })
          );
        });
      });

      describe('with expired property', (): void => {
        let testExpired: Date;

        beforeEach((): void => {
          testExpired = new Date();
        });

        it('whose type is primitive', (): void => {
          const testValue = 'test';
          storageX.setItem(testKey, testValue, testExpired);

          expect(localStorageSpyObj.setItem).toHaveBeenCalledTimes(1);
          expect(localStorageSpyObj.setItem).toHaveBeenCalledWith(
            testKey,
            JSON.stringify({ item: testValue, expired: testExpired.getTime() })
          );
        });

        it('whose type is object', (): void => {
          const testValue = {
            testBoolean: true,
            testString: 'test',
          };
          storageX.setItem(testKey, testValue, testExpired);

          expect(localStorageSpyObj.setItem).toHaveBeenCalledTimes(1);
          expect(localStorageSpyObj.setItem).toHaveBeenCalledWith(
            testKey,
            JSON.stringify({ item: testValue, expired: testExpired.getTime() })
          );
        });
      });
    });

    it('get the event property', (): void => {
      storageX = new StorageX<Test>(StorageTypes.LOCAL);
      expect(storageX.event instanceof StorageXEventController).toEqual(true);
    });

    describe('get an item', (): void => {
      const testValue = 'test';

      const initStorageXItem = (expiredTimeValue?: number): void => {
        const storageXItem: StorageXItem<unknown> = {
          expired: expiredTimeValue
            ? new Date(expiredTimeValue).getTime()
            : undefined,
          item: testValue,
        };

        (localStorageSpyObj.getItem as jest.Mock).mockReturnValue(
          JSON.stringify(storageXItem)
        );
      };

      beforeEach((): void => {
        storageX = new StorageX<Test>(StorageTypes.LOCAL);
        (localStorageSpyObj.getItem as jest.Mock).mockClear();
      });

      it('when there is not in the store', (): void => {
        (localStorageSpyObj.getItem as jest.Mock).mockReturnValue(null);
        expect(storageX.getItem(testKey)).toEqual(undefined);
      });

      it('when there is in the store', (): void => {
        initStorageXItem();
        expect(storageX.getItem(testKey)).toEqual(testValue);
      });

      describe('with expired date', (): void => {
        it('when the stored data is not expired', (): void => {
          const passedExpiredDate = new Date();
          const offsetTimeValue = 1000;
          initStorageXItem(passedExpiredDate.getTime() + offsetTimeValue);

          const item = storageX.getItem(testKey, passedExpiredDate);
          expect(item).toEqual(testValue);
        });

        it('when the stored data is expired', (): void => {
          const passedExpiredDate = new Date();
          const offsetTimeValue = 1000;
          initStorageXItem(passedExpiredDate.getTime() - offsetTimeValue);

          const item = storageX.getItem(testKey, passedExpiredDate);
          expect(item).toEqual(undefined);
        });

        it('when the stored data has not expired date property', (): void => {
          const passedExpiredDate = new Date();
          initStorageXItem();

          const item = storageX.getItem(testKey, passedExpiredDate);
          expect(item).toEqual(testValue);
        });
      });
    });

    describe('remove', (): void => {
      beforeEach((): void => {
        storageX = new StorageX<Test>(StorageTypes.LOCAL);
        (localStorageSpyObj.removeItem as jest.Mock).mockClear();
      });

      it('one item', (): void => {
        storageX.removeItem(testKey);
        expect(localStorageSpyObj.removeItem).toHaveBeenCalledTimes(1);
        expect(localStorageSpyObj.removeItem).toHaveBeenCalledWith(testKey);
      });

      it('more items', (): void => {
        storageX.removeItems([testKey, testKey, testKey]);
        expect(localStorageSpyObj.removeItem).toHaveBeenCalledTimes(3);
        expect(localStorageSpyObj.removeItem).toHaveBeenNthCalledWith(
          1,
          testKey
        );
        expect(localStorageSpyObj.removeItem).toHaveBeenNthCalledWith(
          2,
          testKey
        );
        expect(localStorageSpyObj.removeItem).toHaveBeenNthCalledWith(
          3,
          testKey
        );
      });
    });
  });

  afterEach((): void => {
    (window as any)['localStorage'] = localStorage;
  });
});
