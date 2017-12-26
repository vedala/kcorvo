import Store from "../store.js";
import CorvoTypeList from "../data_types/corvo_type_list.js";
import CorvoTypeListNode from "../data_types/corvo_type_list_node.js";
import MemoryTracker from "../memory_tracker";

describe("corvo node", () => {
  it("exists as a class", () => {
    let testNode = new CorvoTypeListNode();
    expect(testNode.constructor).toBe(CorvoTypeListNode);
  });

  it("takes val argument", () => {
    const val = "My value";
    const key = "key";
    const testNode = new CorvoTypeListNode(val);
    expect(testNode.val).toBe(val);
  });

  it("takes all constructor arguments", () => {
    const val = "My value";
    const key = "key";
    const preceedingNode = new CorvoTypeListNode(null, null);
    const succeedingNode = new CorvoTypeListNode(null, null);
    const testNode = new CorvoTypeListNode(val, preceedingNode, succeedingNode);
    expect(testNode.val).toBe(val);
    expect(testNode.nextNode).toBe(succeedingNode);
    expect(testNode.prevNode).toBe(preceedingNode);
  });

  it("has null default constructor arguments", () => {
    const val = "My value";
    const key = "key";
    const testNode = new CorvoTypeListNode(val);
    expect(testNode.nextNode).toBe(null);
    expect(testNode.prevNode).toBe(null);
  });
});

describe("corvo linked list", () => {
  it("exists as a class", () => {
    let testList = new CorvoTypeList();
    expect(testList.constructor).toBe(CorvoTypeList);
  });

  it("new with no argument creates an empty linked list", () => {
    const testList = new CorvoTypeList();
    expect(testList.head).toBe(null);
    expect(testList.tail).toBe(null);
  });

  it("adds new single node to existing list", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const newNode = new CorvoTypeListNode(key1, value1);
    const testList = new CorvoTypeList(newNode);
    const newNode2 = new CorvoTypeListNode(key2, value2);
    testList.append(newNode2);
    const head = testList.head;
    expect(head.nextNode).toBe(newNode2);
    expect(testList.tail).toBe(newNode2);
  });

  it("prepends single node to existing list", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const newNode = new CorvoTypeListNode(key1, value1);
    const testList = new CorvoTypeList(newNode);
    const newNode2 = new CorvoTypeListNode(key2, value2);
    testList.prepend(newNode2);
    const head = testList.head;
    expect(head).toBe(newNode2);
    expect(head.nextNode).toBe(newNode);
  });

  it("adds multiple nodes to the list with append", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const startNode = new CorvoTypeListNode(key1, value1);
    const testList = new CorvoTypeList(startNode);
    const endNode = new CorvoTypeListNode(key2, value2);

    for (var i = 0; i < 50; i++) {
      const intermediateNode = new CorvoTypeListNode('k' + i, 50);
      testList.append(intermediateNode);
    }

    testList.append(endNode);
    const head = testList.head;
    expect(head).toBe(startNode);
    expect(testList.tail).toBe(endNode);
  });

  it("prepends multiple nodes to list with prepend", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const startNode = new CorvoTypeListNode(key1, value1);
    const testList = new CorvoTypeList(startNode);
    const endNode = new CorvoTypeListNode(key2, value2);

    for (var i = 0; i < 50; i++) {
      const intermediateNode = new CorvoTypeListNode('k' + i, 50);
      testList.prepend(intermediateNode);
    }

    testList.prepend(endNode);
    const head = testList.head;
    expect(head).toBe(endNode);
    expect(testList.tail).toBe(startNode);
  });

  it("pops leftmost node with lpop", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const startNode = new CorvoTypeListNode(key1, value1);
    const testList = new CorvoTypeList(startNode);
    const endNode = new CorvoTypeListNode(key2, value2);
    testList.append(endNode);

    const result = testList.lpop();

    expect(result).toBe(startNode);
    expect(testList.head).toBe(endNode);
  });

  it("pops rightmost node with rpop", () => {
    const key1 = "key1";
    const key2 = "key2";
    const value1 = 100;
    const value2 = 200;

    const startNode = new CorvoTypeListNode(key1, value1);
    const testList = new CorvoTypeList(startNode);
    const endNode = new CorvoTypeListNode(key2, value2);
    testList.append(endNode);

    const result = testList.rpop();

    expect(result).toBe(endNode);
    expect(testList.head).toBe(startNode);
  });
});

describe("store", () => {
  it("exists as a class", () => {
    let testStore = new Store();
    expect(testStore.constructor).toBe(Store);
  });

  it("has mainHash initialized", () => {
    const testStore = new Store();
    expect(Object.keys(testStore.mainHash).length).toBe(0);
  });

  it("has a new instance of memory tracker", () => {
    const testStore = new Store();
    expect(testStore.memoryTracker.constructor).toBe(MemoryTracker);
  });

  it("sets a default max memory value of 100 megabytes", () => {
    const testStore = new Store();
    expect(testStore.memoryTracker.maxMemory).toBe(104857600);
  });

  it("uses exists to check for existence of a key", () => {
    const testStore = new Store();
    const key = "key";
    const val = "value";
    testStore.setString(key, val);
    const keyExists = testStore.exists(key);
    expect(keyExists).toBe(1);
  });

  it("uses exists to check for existence of a key", () => {
    const testStore = new Store();
    const key = "key";

    const keyExists = testStore.exists(key);

    expect(keyExists).toBe(0);
  });

  it("uses type to get the data type of a string key/value", () => {
    const testStore = new Store();
    const key = "key";
    const val = "my string";

    testStore.setString(key, val);
    const type = testStore.type(key);

    expect(type).toBe('string');
  });

  it("uses del to delete a single key and value and expect return value to be 1", () => {
    const testStore = new Store();
    const key = "key";
    const val = "my string";

    testStore.setString(key, val);
    const returnVal = testStore.del(key);
    const lookupResult = testStore.getString(key);

    expect(lookupResult).toBe(null);
    expect(returnVal).toBe(1);
    expect(testStore.memoryTracker.memoryUsed).toBe(0);
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

  it("uses rename to rename an exising key and returns OK", () => {
    const testStore = new Store();
    const keyA = "key";
    const keyB = "newKey";
    const val = "my string";

    testStore.setString(keyA, val);
    const returnVal = testStore.rename(keyA, keyB);

    expect(testStore.getString(keyB)).toBe(val);
    expect(returnVal).toBe("OK");
  });

  it("uses rename to throw error if key doesn't exist", () => {
    const testStore = new Store();

    expect(() => { testStore.rename("keyA", "keyB") }).toThrow(new Error("StoreError: No such key."));
  });

  it("uses renameNX to rename an existing key and returns 1", () => {
    const testStore = new Store();
    const keyA = "key";
    const keyB = "newKey";
    const val = "my string";

    testStore.setString(keyA, val);
    const returnVal = testStore.renameNX(keyA, keyB);

    expect(testStore.getString(keyB)).toBe(val);
    expect(returnVal).toBe(1);
  });

  it("uses renameNX to throw error if key to be renamed doesn't exist", () => {
    const testStore = new Store();
    const keyA = "key";
    const keyB = "keyB"

    expect(() => { testStore.renameNX(keyA, keyB) }).toThrow(new Error("StoreError: No such key"));
  });

  it("uses renameNX to return 0 if keyB already exists and verify keyB still exists", () => {
    const testStore = new Store();
    const keyA = "keyA";
    const valA = "some-valueA";
    const keyB = "keyB"
    const valB = "some-valueB";

    testStore.setString(keyA, valA);
    testStore.setString(keyB, valB);
    const returnVal = testStore.renameNX(keyA, keyB)

    expect(returnVal).toBe(0);
    expect(testStore.getString(keyB)).toBe(valB);
  });

  it("accepts multiple values for lpush", () => {
    const key = 'k';
    const testStore = new Store();
    const val1 = '1';
    const val2 = '2';

    testStore.lpush(key, val1, val2);

    expect(testStore.mainHash[key].val.length).toBe(2);
  });
});
