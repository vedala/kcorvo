import Store from "../store.js";
import CorvoTypeListNode from "../data_types/corvo_type_list_node.js";
import MemoryTracker from "../memory_tracker";
import HashValueNode from "../hash_value_node.js";
import CorvoLruEviction from '../corvo_lru_eviction.js';

const DEFAULT_MAX_MEMORY = 104857600; // equals 100MB
const DEFAULT_EVICTION_POLICY = "lru";

describe("corvo node", () => {
  it("uses setString method to set one key/value in store and return OK", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key1";
    const value = "this-is-the-value";
    const returnVal = testStore.setString(key, value);
    expect(testStore.mainHash[key].val).toBe(value);
    expect(returnVal).toBe("OK");
  });

  it("uses setString method to overwrite one value in store", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key1";
    const value1 = "this-is-the-value1";
    const value2 = "this-is-the-value2";

    testStore.setString(key, value1);
    expect(testStore.getString(key)).toBe(value1);

    testStore.setString(key, value2);
    expect(testStore.getString(key)).toBe(value2);
  });

  it("uses setString method to set two key/value items in store", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key1 = "key1";
    const value1 = "this-is-the-value-1";
    const key2 = "key2";
    const value2 = "this-is-the-value-2";
    testStore.setString(key1, value1);
    testStore.setString(key2, value2);
    expect(testStore.mainHash[key1].val).toBe(value1);
    expect(testStore.mainHash[key2].val).toBe(value2);
  });

  it("uses setString method to overwrite a key containing list type", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key1";
    const val1 = '1';
    const val2 = '2';
    const strValue1 = "this-is-the-value1";

    testStore.lpush(key, val1);
    testStore.setString(key, strValue1);
    expect(testStore.getString(key)).toBe(strValue1);
    expect(testStore.mainHash[key].type).toBe("string");
  });

  it("uses setStringX to overwrite a single key/value in store and return OK", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key";
    const value1 = "this-is-the-value1";
    const value2 = "this-is-the-value2";

    testStore.setString(key, value1);
    expect(testStore.getString(key)).toBe(value1);
    const returnVal = testStore.setStringX(key, value2);
    expect(testStore.getString(key)).toBe(value2);
    expect(returnVal).toBe("OK");
  });

  it("can't use setStringX method to create new key/value in store", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key";
    const value = "this-is-the-value";

    expect(testStore.setStringX(key, value)).toBe(null);
    expect(testStore.getString(key)).toBe(null);
  });

  it("uses setStringX method to overwrite a key containing list type", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key1";
    const val1 = '1';
    const val2 = '2';
    const strValue1 = "this-is-the-value1";

    testStore.lpush(key, val1, val2);

    testStore.setStringX(key, strValue1);
    expect(testStore.getString(key)).toBe(strValue1);
    expect(testStore.mainHash[key].type).toBe("string");
  });

  it("uses setStringNX method to create new key/value in store and return OK", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key";
    const value = "this-is-the-value";

    const returnVal = testStore.setStringNX(key, value);

    expect(testStore.getString(key)).toBe(value);
    expect(returnVal).toBe("OK");
  });

  it("can't use setStringNX method to overwrite key/value in store", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key";
    const value1 = "this-is-the-value1";
    const value2 = "this-is-the-value2";

    testStore.setStringNX(key, value1);
    expect(testStore.getString(key)).toBe(value1);
    expect(testStore.setStringNX(key, value2)).toBe(null);
    expect(testStore.getString(key)).toBe(value1);
  });

  it("uses setStringNX method to overwrite a key containing list type", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key1";
    const val1 = '1';
    const val2 = '2';
    const strValue1 = "this-is-the-value1";

    testStore.lpush(key, val1, val2);

    testStore.setStringNX(key, strValue1);
    expect(testStore.mainHash[key].type).toBe("list");
    expect(testStore.mainHash[key].val.head.val).toBe("2");
    expect(testStore.mainHash[key].val.head.nextNode.val).toBe("1");
  });

  it("uses getString method to retrieve corresponding value for a key", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key1 = "key1";
    const value1 = "this-is-the-value-1";

    testStore.setString(key1, value1);
    const valueFromStore = testStore.getString(key1);
    expect(valueFromStore).toBe(value1);
  });

  it("appends string value to value in memory with appendString and returns length of newly updated value", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key1";
    const valueA = "Hello, ";
    const valueB = "World!";
    const result = "Hello, World!";

    testStore.setString(key, valueA);
    const returnVal = testStore.appendString(key, valueB);

    expect(testStore.getString(key)).toBe(result);
    expect(returnVal).toBe(result.length);
  });

  it("appends string value to a non-existent key with appendString and returns length of newly updated value", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key1";
    const valueA = "Hello";
    const result = 5;

    const returnVal = testStore.appendString(key, valueA);
    expect(returnVal).toBe(result);
    expect(testStore.getString(key)).toBe(valueA);
  });

  it("uses getStrLen to return number representation of string length", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key1";
    const value = "123456789";

    testStore.setString(key, value);
    const len = testStore.getStrLen(key);
    expect(len).toBe(value.length);
  });

  it("uses getStrLen to return 0 if key does not exist", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = "key1";
    const value = "123456789";

    testStore.setString(key, value);
    const len = testStore.getStrLen("key2");
    expect(len).toBe(0);
  });

  it("uses strIncr to increment number stored as string and verify returns the incremented number", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = 'key';
    const value = '1';

    testStore.setString(key, value);
    const returnVal = testStore.strIncr(key);
    expect(testStore.getString(key)).toBe('2');
    expect(returnVal).toBe(2);
  });

  it("uses strIncr to create a new key/value of 0 and then increment it", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = 'key';

    testStore.strIncr(key);
    expect(testStore.getString(key)).toBe('1');
  });

  it("it throws error if strIncr used on non-number string", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = 'key';
    const value = 'Aw heck';

    testStore.setString(key, value);
    expect(() => { testStore.strIncr(key) }).toThrow(new Error("StoreError: value at key is not a number string."));
  });

  it("uses strDecr to decrement number stored as string and verify return value is the decremented value", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = 'key';
    const value = '9';

    testStore.setString(key, value);
    const returnVal = testStore.strDecr(key);
    expect(testStore.getString(key)).toBe('8');
    expect(returnVal).toBe(8);
  });

  it("uses strDecr to create a new key/value of 0 and then decrement it", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = 'key';

    testStore.strDecr(key);
    expect(testStore.getString(key)).toBe('-1');
  });

  it("throws error if strDecr used on non-number string", () => {
    const testStore = new Store(DEFAULT_MAX_MEMORY, DEFAULT_EVICTION_POLICY);
    const key = 'key';
    const value = 'Aw heck';

    testStore.setString(key, value);
    expect(() => { testStore.strDecr(key) }).toThrow(new Error("StoreError: value at key is not a number string."));
  });

  it("returns null when getString called for non-existent key", () => {
    const testStore = new Store();
    const key1 = "key1";
    const value1 = "this-is-the-value-1";

    testStore.setString(key1, value1);
    const valueFromStore = testStore.getString("non-existent-key");
    expect(valueFromStore).toBe(null);
  });

});
