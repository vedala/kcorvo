import Store from "../store.js";
import MemoryTracker from "../memory_tracker";

describe("MemoryTracker", () => {
  const REFERENCE_SIZE_BYTES = 8;
  const STRING_ONE_CHAR_BYTES = 2;

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
});
