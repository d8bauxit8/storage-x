import { StorageTypes, StorageXCollectionKey, StorageXItem } from './storage-x';
import { StorageXDependencies } from './storage-x-dependencies';

export interface StorageXEvent<Key, Value> {
  key: Key;
  oldValue: Value | undefined;
  newValue: Value | undefined;
  type: StorageTypes;
}

export type StorageXEventHandler<Key, Value> = (
  event: StorageXEvent<Key, Value>
) => void;

type StorageXEventHandlerCollection<StorageXCollection> = {
  [Key in StorageXCollectionKey<StorageXCollection>]?: Array<
    StorageXEventHandler<Key, StorageXCollection[Key]>
  >;
};

enum DependencyProperties {
  ON_STORAGE = 'onstorage',
  SET_TIMEOUT = 'setTimeout',
  ADD_EVENT_LISTENER = 'addEventListener',
}

interface StorageXEventControllerDependencies {
  [DependencyProperties.SET_TIMEOUT]: WindowOrWorkerGlobalScope['setTimeout'];
  [DependencyProperties.ON_STORAGE]: WindowEventHandlers['onstorage'];
  [DependencyProperties.ADD_EVENT_LISTENER]: WindowEventHandlers['addEventListener'];
}

const STORAGE_EVENT_NAME = 'storage';

export class StorageXEventController<
  StorageXCollection
> extends StorageXDependencies<StorageXEventControllerDependencies> {
  private readonly storageXEventHandlerCollection: StorageXEventHandlerCollection<
    StorageXCollection
  > = {};

  constructor(
    private readonly storageType: StorageTypes,
    private readonly storage: Storage
  ) {
    super();

    if (!this.isStorageEventAvailable()) {
      throw new Error(`The ${STORAGE_EVENT_NAME} event is not available!`);
    }

    if (!this.isEventLoopAvailable()) {
      throw new Error(
        `The event loop is not available! (${DependencyProperties.SET_TIMEOUT})`
      );
    }

    // Initialization storage event
    this.dependencies[DependencyProperties.ADD_EVENT_LISTENER]<'storage'>(
      STORAGE_EVENT_NAME,
      (event: StorageEvent): void => this.storageEventHandler(event),
      {
        passive: true,
      }
    );
  }

  add<Key extends StorageXCollectionKey<StorageXCollection>>(
    key: Key,
    handler: StorageXEventHandler<Key, StorageXCollection[Key]>
  ): void {
    const handlerList = this.getHandlerList(key);

    if (handlerList) {
      handlerList.push(handler);
      return;
    }

    this.storageXEventHandlerCollection[key] = [handler];
  }

  remove<Key extends StorageXCollectionKey<StorageXCollection>>(
    key: Key,
    handler: StorageXEventHandler<Key, StorageXCollection[Key]>
  ): void {
    const handlerList = this.getHandlerList(key);

    if (handlerList) {
      const indexOfHandler = handlerList.indexOf(handler);
      const notFoundItemReturnValue = -1;

      if (indexOfHandler !== notFoundItemReturnValue) {
        const deleteCount = 1;
        handlerList.splice(indexOfHandler, deleteCount);
      }
    }
  }

  removeAllInKey<Key extends StorageXCollectionKey<StorageXCollection>>(
    key: Key
  ): void {
    if (this.storageXEventHandlerCollection[key]) {
      delete this.storageXEventHandlerCollection[key];
    }
  }

  private isEventLoopAvailable(): boolean {
    return !!this.dependencies[DependencyProperties.SET_TIMEOUT];
  }

  private isStorageEventAvailable(): boolean {
    return (
      this.dependencies.hasOwnProperty(DependencyProperties.ON_STORAGE) &&
      !!this.dependencies[DependencyProperties.ADD_EVENT_LISTENER]
    );
  }

  private storageEventHandler(storageEvent: StorageEvent): void {
    if (storageEvent.storageArea && storageEvent.storageArea === this.storage) {
      const key: StorageXCollectionKey<StorageXCollection> = storageEvent.key as StorageXCollectionKey<
        StorageXCollection
      >;
      const handlerList = this.getHandlerList(key);

      if (handlerList) {
        const storageXEvent: StorageXEvent<
          typeof key,
          StorageXCollection[typeof key]
        > = this.createStorageXEvent(storageEvent);

        handlerList.forEach(
          (
            handler: StorageXEventHandler<
              typeof key,
              StorageXCollection[typeof key]
            >
          ): void => {
            this.dependencies[DependencyProperties.SET_TIMEOUT]((): void => {
              handler(storageXEvent);
            });
          }
        );
      }
    }
  }

  private createStorageXEvent<
    Key extends StorageXCollectionKey<StorageXCollection>
  >(storageEvent: StorageEvent): StorageXEvent<Key, StorageXCollection[Key]> {
    return {
      key: storageEvent.key as Key,
      newValue: this.transformEventValue<Key>(
        storageEvent.newValue || undefined
      ),
      oldValue: this.transformEventValue<Key>(
        storageEvent.oldValue || undefined
      ),
      type: this.storageType,
    };
  }

  private transformEventValue<
    Key extends StorageXCollectionKey<StorageXCollection>
  >(
    rawStorageItemXValue: string | undefined
  ): StorageXCollection[Key] | undefined {
    if (rawStorageItemXValue) {
      const storageXItem: StorageXItem<StorageXCollection[Key]> = JSON.parse(
        rawStorageItemXValue
      );
      return !storageXItem ? undefined : storageXItem.item;
    }
    return undefined;
  }

  private getHandlerList<Key extends StorageXCollectionKey<StorageXCollection>>(
    key: Key
  ): Array<StorageXEventHandler<Key, StorageXCollection[Key]>> | undefined {
    return this.storageXEventHandlerCollection[key];
  }
}
