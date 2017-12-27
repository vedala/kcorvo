import Store from "../store.js";

const DEFAULT_MAX_MEMORY = 104857600; // equals 100MB
const DEFAULT_EVICTION_POLICY = "lru";

describe("lru", () => {
  it("getString method moves most recently accessed key to tail of list", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key1 = "key1";
    const value1 = "this-is-the-value-1";
    const key2 = "key2";
    const value2 = "this-is-the-value-2";
    const key3 = "key3";
    const value3 = "this-is-the-value-3";
    const key4 = "key4";
    const value4 = "this-is-the-value-4";

    testStore.setString(key1, value1);
    testStore.setString(key2, value2);
    testStore.setString(key3, value3);
    testStore.setString(key4, value4);
    const lruMainList = testStore.evictionPolicy.policyImplementation.mainList;
    expect(lruMainList.tail.key).toBe(key4);
    const valueFromStore = testStore.getString(key2);
    expect(valueFromStore).toBe(value2);
    expect(lruMainList.tail.key).toBe(key2);
  });

  it("moves touched key value to end of linked list", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key";
    const value = "this-is-the-value";

    testStore.setString(key, value);

    for (var i = 0; i < 50; i++) {
      testStore.setString("key" + i, "Some val");
    }

    const evictionPtr = testStore.mainHash[key].evictionPtr;
    testStore.evictionPolicy.policyImplementation.touch(evictionPtr);
    const lruMainList = testStore.evictionPolicy.policyImplementation.mainList;
    expect(lruMainList.tail.key).toBe(key);
  });

  it("moves multiple touched nodes to end of linked list and returns number of keys touched", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key";
    const value = "this-is-the-value";
    const key2 ="key2";
    const value2 = "value2";

    testStore.setString(key, value);
    testStore.setString(key2, value2);

    for (var i = 0; i < 50; i++) {
      testStore.setString("key" + i, "Some val");
    }

    const returnVal = testStore.touch(key, key2);
    const lruMainList = testStore.evictionPolicy.policyImplementation.mainList;
    expect(lruMainList.tail.key).toBe(key2);
    expect(lruMainList.tail.prevNode.key).toBe(key);
    expect(returnVal).toBe(2);
  });

  it("moves multiple existing keys to end of linked list and returns number of existing keys touched", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key";
    const value = "this-is-the-value";
    const key2 ="key2";
    const value2 = "value2";

    testStore.setString(key, value);
    testStore.setString(key2, value2);

    for (var i = 0; i < 50; i++) {
      testStore.setString("key" + i, "Some val");
    }

    const returnVal = testStore.touch(key, key2, "randKey");
    const lruMainList = testStore.evictionPolicy.policyImplementation.mainList;
    expect(lruMainList.tail.key).toBe(key2);
    expect(lruMainList.tail.prevNode.key).toBe(key);
    expect(returnVal).toBe(2);
  });

  it("evicts least-recently touched key/value from store when lruEvict is invoked", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = 'key';
    const value = 'Aw heck';

    testStore.setString(key, value);
    testStore.evictionPolicy.policyImplementation.lruEvict(testStore.mainHash);
    const lruMainList = testStore.evictionPolicy.policyImplementation.mainList;
    expect(lruMainList.tail).toBe(null);
    expect(testStore.mainHash[key]).toBe(undefined);
  });

  it("evicts least-recently touched key/value from store when lruEvict is invoked", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key1 = 'key1';
    const key2 = 'key2';
    const value1 = 'Some val';
    const value2 = 'another val';

    testStore.setString(key1, value1);
    testStore.setString(key2, value2);
    testStore.evictionPolicy.policyImplementation.lruEvict(testStore.mainHash);
    const lruMainList = testStore.evictionPolicy.policyImplementation.mainList;
    expect(lruMainList.tail.key).toBe(key2);
    expect(testStore.mainHash[key1]).toBe(undefined);
  });

  it("uses lruCheckAndEvictToMaxMemory to bring total store memory below threshold", () => {
    const testStore = new Store(1475, DEFAULT_EVICTION_POLICY);
    for (var i = 0; i < 10; i++) {
      testStore.setString("key" + i, "abcdefghijklmnopqrstuvwxyzabc" + i);
    }

    const lruMainList = testStore.evictionPolicy.policyImplementation.mainList;
    expect(lruMainList.head.key).toBe("key0");
    testStore.setString("key-xyz", "xyz");
    expect(lruMainList.head.key).toBe("key1");
  });

});
