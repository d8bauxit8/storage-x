import { StorageXDependencies } from './storage-x-dependencies';
import { StorageXEventController } from './storage-x-event-controller';

export interface StorageXItem<Data> {
  item: Data;
  expired?: number;
}

export type StorageXCollectionKey<
  StorageXCollection
> = keyof StorageXCollection extends string ? keyof StorageXCollection : never;

export enum StorageTypes {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage',
}

export class StorageX<StorageXCollection> extends StorageXDependencies<
  StorageTypes
> {
  private readonly storage: Storage;
  private readonly eventController: StorageXEventController<StorageXCollection>;

  constructor(private readonly storageType: StorageTypes) {
    super();

    if (!StorageX.isJSONAvailable()) {
      throw new Error('The JSON API is not available!');
    }

    if (!this.isStorageAvailable()) {
      throw new Error(`The ${this.storageType} storage is not available!`);
    }

    this.storage = this.dependencies[this.storageType];

    this.eventController = new StorageXEventController<StorageXCollection>(
      this.storageType,
      this.storage
    );
  }

  get event(): StorageXEventController<StorageXCollection> {
    return this.eventController;
  }

  private static isFirefoxError(error: DOMException): boolean {
    // everything except Firefox
    const errorCode22 = 22;
    const errorCode1014 = 1014;
    return (
      error.code === errorCode22 ||
      // Firefox
      error.code === errorCode1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      error.name === 'QuotaExceededError' ||
      // Firefox
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    );
  }

  private static isJSONAvailable(): boolean {
    return (
      JSON && JSON.hasOwnProperty('parse') && JSON.hasOwnProperty('stringify')
    );
  }

  setItem<Key extends StorageXCollectionKey<StorageXCollection>>(
    key: Key,
    newItem: StorageXCollection[Key],
    expired?: Date
  ): void {
    const itemToBeStored: StorageXItem<StorageXCollection[Key]> = {
      item: newItem,
    };

    if (expired) {
      itemToBeStored.expired = expired.getTime();
    }

    this.storage.setItem(key, JSON.stringify(itemToBeStored));
  }

  getItem<Key extends StorageXCollectionKey<StorageXCollection>>(
    key: Key,
    referenceExpired?: Date
  ): StorageXCollection[Key] | undefined {
    const storageItem:
      | StorageXItem<StorageXCollection[Key]>
      | undefined = this.getStorageXItem(key);
    if (!storageItem) {
      return undefined;
    }

    if (this.isExpired(storageItem, referenceExpired || new Date())) {
      return undefined;
    }

    return storageItem.item;
  }

  removeItem<Key extends StorageXCollectionKey<StorageXCollection>>(
    key: Key
  ): void {
    this.storage.removeItem(key);
  }

  removeItems<Key extends StorageXCollectionKey<StorageXCollection>>(
    keys: Key[]
  ): void {
    keys.forEach((key: Key): void => this.removeItem(key));
  }

  private isStorageAvailable(): boolean {
    let storage;
    try {
      storage = this.dependencies[this.storageType];

      const testValue = '__storage_test__';
      storage.setItem(testValue, testValue);
      storage.removeItem(testValue);

      return true;
    } catch (error) {
      return (
        error instanceof DOMException &&
        StorageX.isFirefoxError(error) &&
        // acknowledge QuotaExceededError only if there's something already stored
        !!storage &&
        !!storage?.length
      );
    }
  }

  private getStorageXItem<
    Key extends StorageXCollectionKey<StorageXCollection>
  >(key: Key): StorageXItem<StorageXCollection[Key]> | undefined {
    const item = this.storage.getItem(key);
    return item && JSON.parse(item);
  }

  private isExpired<Key extends StorageXCollectionKey<StorageXCollection>>(
    storageItem: StorageXItem<StorageXCollection[Key]>,
    referenceExpired: Date
  ): boolean {
    return (
      !!storageItem.expired && storageItem.expired < referenceExpired.getTime()
    );
  }
}
