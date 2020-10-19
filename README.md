# StorageX

Actually this package will help you to use a strongly typed storage and its events.

My problem is that, I really like the strongly typed languages, like TypeScript,
but unfortunately in this language the storage API does not support the generic types.
Thus, I decided to write an own package to solve my problem.

In progress :pushpin:
If I have some free time, I work on this.

## Example

```ts
import { StorageTypes, StorageX } from './storage-x';

// Create models, which you want to use.
interface LocalStorageModel1 {
  item1: string;
  item2: {
    id: number;
    value: string;
  };
}

interface LocalStorageModel2 {
  item3: string;
  item4: boolean;
}

type LocalStorageModel = LocalStorageModel1 & LocalStorageModel2;

// Create localStorage object for which you can pass the given store mode
const localStorageX: StorageX<LocalStorageModel> = new StorageX<
  LocalStorageModel
>(StorageTypes.LOCAL);

// All of methods and properties are strictly typesafe.
localStorageX.event.add('item2', (event) => {
  console.log('StorageX event: ', event);
});

localStorageX.setItem('item1', 'Hello');
console.log('Set the item1 property');

localStorageX.setItem('item2', {
  id: 1,
  value: 'World!',
});
console.log('Set the item2 property');
```
