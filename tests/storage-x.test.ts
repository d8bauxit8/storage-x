import { StorageTypes, StorageX } from '../src/storage-x';

interface Test {
  __UTest__: string;
}

describe('StorageX', (): void => {
  let storageX: StorageX<Test>;

  beforeEach((): void => {
    storageX = new StorageX<Test>(StorageTypes.LOCAL);
  });

  it('should be created', (): void => {
    expect(storageX).toBeTruthy();
  });
});
