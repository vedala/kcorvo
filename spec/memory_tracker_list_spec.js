import Store from "../store.js";
import CorvoTypeList from "../data_types/corvo_type_list.js";
import CorvoTypeListNode from '../data_types/corvo_type_list_node.js';
import MemoryTracker from "../memory_tracker";

describe("MemoryTracker", () => {
  it("uses listItemDelete to decrement memory used", () => {
    const testTracker = new MemoryTracker(100);
    testTracker.memoryUsed = 80;
    const val = 'my value';
    const testListNode = new CorvoListNode(val);

    testTracker.listItemDelete(testListNode);
    expect(testTracker.memoryUsed).toBe(40);
  });

  it("uses listItemInsert to update memory used", () => {
    const testTracker = new MemoryTracker(100);

    const val = 'my value';
    const testListNode = new CorvoListNode(val);

    testTracker.listItemInsert(testListNode.val);
    expect(testTracker.memoryUsed).toBe(40);
  });

  it("uses lpush to update memory used", () => {
    const testStore = new Store();
    const key = "mykey";
    const val = "value";
    testStore.lpush(key, val);

    let expectedMemoryUsed;
    // hash entry
    expectedMemoryUsed = key.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
    // hash value node
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * "list".length;
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    // linked list
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    // linked list node
    expectedMemoryUsed += REFERENCE_SIZE_BYTES * 3;
    expectedMemoryUsed += STRING_ONE_CHAR_BYTES * val.length;

    expect(testStore.memoryTracker.memoryUsed).toBe(expectedMemoryUsed);
  });

  it("uses lpush to add two items to the list", () => {
    const testStore = new Store();
    const key = "mykey";
    const val1 = "value1";
    const val2 = "value2";
    testStore.lpush(key, val1);
    expect(testStore.memoryTracker.memoryUsed).toBe(144);
    testStore.lpush(key, val2);
    expect(testStore.memoryTracker.memoryUsed).toBe(180);
  });

  it("uses rpush to add two items to the list", () => {
    const testStore = new Store();
    const key = "mykey";
    const val1 = "value1";
    const val2 = "value2";
    testStore.rpush(key, val1);
    expect(testStore.memoryTracker.memoryUsed).toBe(144);
    testStore.rpush(key, val2);
    expect(testStore.memoryTracker.memoryUsed).toBe(180);
  });

  it("uses rpush to add two items to the list in one invocation", () => {
    const testStore = new Store();
    const key = "mykey";
    const val1 = "value1";
    const val2 = "value2";
    testStore.rpush(key, val1, val2);
    expect(testStore.memoryTracker.memoryUsed).toBe(180);
  });

  it("lset sets value of field to new value and returns OK", () => {
    const testStore = new Store();
    const key1 = "key-1";
    const val1 = "value-1";
    const val2 = "value-2";
    const val3 = "value-3";
    const updatedVal = "new-value";
    const idx = 1;

    testStore.rpush(key1, val1);
    testStore.rpush(key1, val2);
    testStore.rpush(key1, val3);

    expect(testStore.memoryTracker.memoryUsed).toBe(222);
    const returnVal = testStore.lset(key1, idx, updatedVal);
    expect(returnVal).toBe("OK");
    expect(testStore.lindex(key1, idx)).toBe(updatedVal);
    expect(testStore.memoryTracker.memoryUsed).toBe(226);
  });

});
