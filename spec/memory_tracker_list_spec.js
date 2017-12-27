import Store from "../store.js";
import CorvoTypeList from "../data_types/corvo_type_list.js";
import CorvoTypeListNode from '../data_types/corvo_type_list_node.js';
import MemoryTracker from "../memory_tracker";

const DEFAULT_MAX_MEMORY = 104857600; // equals 100MB
const DEFAULT_EVICTION_POLICY = "lru";

describe("MemoryTracker", () => {
  const REFERENCE_SIZE_BYTES = 8;
  const STRING_ONE_CHAR_BYTES = 2;
  const NUMBER_BYTES = 8;

  it("uses listItemDelete to decrement memory used", () => {
    const testTracker = new MemoryTracker(100);
    testTracker.memoryUsed = 80;
    const val = 'my value';
    const testListNode = new CorvoTypeListNode(val);

    testTracker.listItemDelete(testListNode);
    expect(testTracker.memoryUsed).toBe(40);
  });

  it("uses listItemInsert to update memory used", () => {
    const testTracker = new MemoryTracker(100);

    const val = 'my value';
    const testListNode = new CorvoTypeListNode(val);

    testTracker.listItemInsert(testListNode.val);
    expect(testTracker.memoryUsed).toBe(40);
  });

  it("uses lpush to update memory used", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "mykey";
    const val = "value";
    testStore.lpush(key, val);

    let expectedMemoryUsed;
    // hash entry
    expectedMemoryUsed = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * "list".length;
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    // lru linked list
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += NUMBER_BYTES * 1;
    // lru linked list node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * key.length;
    // list type linked list
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += NUMBER_BYTES * 1;
    // list type node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * val.length;

    expect(testStore.memoryTracker.memoryUsed).toBe(expectedMemoryUsed);
  });

  it("uses lpush to add two items to the list", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "mykey";
    const val1 = "value1";
    const val2 = "value2";

    let expectedMemoryUsed;
    // hash entry
    expectedMemoryUsed = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * "list".length;
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    // lru linked list
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += NUMBER_BYTES * 1;
    // lru linked list node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * key.length;
    // list type linked list
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += NUMBER_BYTES * 1;
    // list type node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * val1.length;

    testStore.lpush(key, val1);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedMemoryUsed);

    // list type node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * val2.length;

    testStore.lpush(key, val2);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedMemoryUsed);
  });

  it("uses rpush to add two items to the list", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "mykey";
    const val1 = "value1";
    const val2 = "value2";

    let expectedMemoryUsed;
    // hash entry
    expectedMemoryUsed = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * "list".length;
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    // lru linked list
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += NUMBER_BYTES * 1;
    // lru linked list node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * key.length;
    // list type linked list
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += NUMBER_BYTES * 1;
    // list type node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * val1.length;

    testStore.rpush(key, val1);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedMemoryUsed);

    // list type node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * val2.length;

    testStore.rpush(key, val2);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedMemoryUsed);
  });

  it("uses rpush to add two items to the list in one invocation", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "mykey";
    const val1 = "value1";
    const val2 = "value2";

    let expectedMemoryUsed;
    // hash entry
    expectedMemoryUsed = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * "list".length;
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    // lru linked list
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += NUMBER_BYTES * 1;
    // lru linked list node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * key.length;
    // list type linked list
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += NUMBER_BYTES * 1;
    // list type node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * val1.length;
    // list type node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * val2.length;

    testStore.rpush(key, val1, val2);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedMemoryUsed);
  });

  it("lset sets value of field to new value and returns OK", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key1 = "key-1";
    const val1 = "value-1";
    const val2 = "value-22";
    const val3 = "value-333";
    const updatedVal = "new-longer-value";
    const idx = 1;

    let expectedMemoryUsed;
    // hash entry
    expectedMemoryUsed = key1.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * "list".length;
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    // lru linked list
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += NUMBER_BYTES * 1;
    // lru linked list node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * key1.length;
    // list type linked list
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += NUMBER_BYTES * 1;
    // list type node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * val1.length;
    // list type node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * val2.length;
    // list type node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * val3.length;

    testStore.rpush(key1, val1);
    testStore.rpush(key1, val2);
    testStore.rpush(key1, val3);

    expect(testStore.memoryTracker.memoryUsed).toBe(expectedMemoryUsed);

    expectedMemoryUsed -= STRING_ONE_CHAR_BYTES * val2.length;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * updatedVal.length;
    const returnVal = testStore.lset(key1, idx, updatedVal);
    expect(returnVal).toBe("OK");
    expect(testStore.lindex(key1, idx)).toBe(updatedVal);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedMemoryUsed);
  });

});
