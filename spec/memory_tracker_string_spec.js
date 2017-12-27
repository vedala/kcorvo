import Store from "../store.js";
import MemoryTracker from "../memory_tracker";

const DEFAULT_MAX_MEMORY = 104857600; // equals 100MB
const DEFAULT_EVICTION_POLICY = "lru";

describe("MemoryTracker", () => {
  const REFERENCE_SIZE_BYTES = 8;
  const STRING_ONE_CHAR_BYTES = 2;
  const NUMBER_BYTES = 8;

  it("returns correct size for calculateStoreItemSize", () => {
    const testMemoryTracker = new MemoryTracker();
    const key = "a-key";
    const val = "a-value";
    const type = "string";
    // hash entry
    let expectedSize = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedSize += STRING_ONE_CHAR_BYTES * "string".length;
    expectedSize += STRING_ONE_CHAR_BYTES * val.length;
    expectedSize += REFERENCE_SIZE_BYTES * 3;

    expect(testMemoryTracker.calculateStoreItemSize(key, val, type)).toBe(expectedSize);
  });

  it("calculates memory used for a set operation", () => {
    const testStore = new Store();
    const key = "key";
    const value = "value";

    // hash entry
    let expectedSize = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedSize += STRING_ONE_CHAR_BYTES * "string".length;
    expectedSize += STRING_ONE_CHAR_BYTES * value.length;
    expectedSize += REFERENCE_SIZE_BYTES * 3;

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
  });

  it("updates memory used for a set operation on existing key", () => {
    const testStore = new Store();
    const key = "key";
    const oldValue = "value";
    const newValue = "new-value-that-is-longer";

    // hash entry
    let expectedSize = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedSize += STRING_ONE_CHAR_BYTES * "string".length;
    expectedSize += STRING_ONE_CHAR_BYTES * oldValue.length;
    expectedSize += REFERENCE_SIZE_BYTES * 3;

    testStore.setString(key, oldValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
    testStore.setString(key, newValue);
    expectedSize -= STRING_ONE_CHAR_BYTES * oldValue.length;
    expectedSize += STRING_ONE_CHAR_BYTES * newValue.length;
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
  });

  it("updates memory used for a setStringX operation", () => {
    const testStore = new Store();
    const key = "key";
    const oldValue = "value";
    const newValue = "new-value-that-is-longer";

    // hash entry
    let expectedSize = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedSize += STRING_ONE_CHAR_BYTES * "string".length;
    expectedSize += STRING_ONE_CHAR_BYTES * oldValue.length;
    expectedSize += REFERENCE_SIZE_BYTES * 3;

    testStore.setString(key, oldValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
    testStore.setStringX(key, newValue);
    expectedSize -= STRING_ONE_CHAR_BYTES * oldValue.length;
    expectedSize += STRING_ONE_CHAR_BYTES * newValue.length;
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
  });

  it("calculates memory used for a setStringNX operation", () => {
    const testStore = new Store();
    const key = "key";
    const value = "value";

    // hash entry
    let expectedSize = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedSize += STRING_ONE_CHAR_BYTES * "string".length;
    expectedSize += STRING_ONE_CHAR_BYTES * value.length;
    expectedSize += REFERENCE_SIZE_BYTES * 3;

    testStore.setStringNX(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
  });

  it("updates memory used for a appendString operation", () => {
    const testStore = new Store();
    const key = "key";
    const oldValue = "value";
    const newValue = "new-value-that-is-longer";

    // hash entry
    let expectedSize = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedSize += STRING_ONE_CHAR_BYTES * "string".length;
    expectedSize += STRING_ONE_CHAR_BYTES * oldValue.length;
    expectedSize += REFERENCE_SIZE_BYTES * 3;

    testStore.setString(key, oldValue);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);

    testStore.appendString(key, newValue);
    expectedSize += STRING_ONE_CHAR_BYTES * newValue.length;
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
  });

  it("doesn't change memory used for strIncr operation that doesn't increase length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '1';

    // hash entry
    let expectedSize = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedSize += STRING_ONE_CHAR_BYTES * "string".length;
    expectedSize += STRING_ONE_CHAR_BYTES * value.length;
    expectedSize += REFERENCE_SIZE_BYTES * 3;

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
    testStore.strIncr(key);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
  });

  it("changes memory used for strIncr operation that increases length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '9';

    // hash entry
    let expectedSize = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedSize += STRING_ONE_CHAR_BYTES * "string".length;
    expectedSize += STRING_ONE_CHAR_BYTES * value.length;
    expectedSize += REFERENCE_SIZE_BYTES * 3;

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
    testStore.strIncr(key);
    expectedSize += STRING_ONE_CHAR_BYTES * 1;
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
  });

  it("doesn't change memory used for strDecr operation that doesn't decrease length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '1';

    // hash entry
    let expectedSize = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedSize += STRING_ONE_CHAR_BYTES * "string".length;
    expectedSize += STRING_ONE_CHAR_BYTES * value.length;
    expectedSize += REFERENCE_SIZE_BYTES * 3;

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
    testStore.strDecr(key);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
  });

  it("changes memory used for strDecr operation that decreases length of string", () => {
    const testStore = new Store();
    const key = 'key';
    const value = '10';

    // hash entry
    let expectedSize = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedSize += STRING_ONE_CHAR_BYTES * "string".length;
    expectedSize += STRING_ONE_CHAR_BYTES * value.length;
    expectedSize += REFERENCE_SIZE_BYTES * 3;

    testStore.setString(key, value);
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
    testStore.strDecr(key);
    expectedSize -= STRING_ONE_CHAR_BYTES * 1;
    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
  });

  it("uses maxMemoryExceeded to return true if maxMemory exceeded", () => {
    const testTracker = new MemoryTracker(10);
    testTracker.memoryUsed = 20;

    expect(testTracker.maxMemoryExceeded()).toBe(true);
  });

  it("uses maxMemoryExceeded to return false if maxMemory is not exceeded", () => {
    const testTracker = new MemoryTracker(30);
    testTracker.memoryUsed = 20;

    expect(testTracker.maxMemoryExceeded()).toBe(false);
  });

  it("uses del to delete a single key and value and expect return value to be 1", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key";
    const val = "my string";

    testStore.setString(key, val);
    const returnVal = testStore.del(key);
    const lookupResult = testStore.getString(key);

    expect(lookupResult).toBe(null);
    expect(returnVal).toBe(1);

    let expectedSize = 0;
    // lru linked list
    expectedSize += REFERENCE_SIZE_BYTES * 3;
    expectedSize += NUMBER_BYTES * 1;

    expect(testStore.memoryTracker.memoryUsed).toBe(expectedSize);
  });

  it("uses del to delete multiple keys and values and expect return value to be equal to number of keys deleted", () => {
    const testStore = new Store();
    const keyA = "key";
    const valA = "my string";
    const keyB = "keyB";
    const valB = "my string";

    testStore.setString(keyA, valA);
    testStore.setString(keyB, valB);
    const returnVal = testStore.del(keyA, keyB);
    const lookupResultA = testStore.getString(keyA);
    const lookupResultB = testStore.getString(keyB);

    expect(lookupResultA).toBe(null);
    expect(lookupResultB).toBe(null);
    expect(returnVal).toBe(2);
    expect(testStore.memoryTracker.memoryUsed).toBe(0);
  });

  it("uses del to delete multiple keys and non-existent keys and returns an integer equal to number of keys actually deleted", () => {
    const testStore = new Store();
    const keyA = "key";
    const valA = "my string";
    const keyB = "keyB";
    const valB = "my string";

    testStore.setString(keyA, valA);
    testStore.setString(keyB, valB);
    const returnVal = testStore.del(keyA, keyB, "keyC", "keyD");
    const lookupResultA = testStore.getString(keyA);
    const lookupResultB = testStore.getString(keyB);

    expect(lookupResultA).toBe(null);
    expect(lookupResultB).toBe(null);
    expect(returnVal).toBe(2);
    expect(testStore.memoryTracker.memoryUsed).toBe(0);
  });

});
