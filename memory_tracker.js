const REFERENCE_SIZE_BYTES = 8;
const STRING_ONE_CHAR_BYTES = 2;
const NODE_NUM_REFS = 3;
const NUMBER_BYTES = 8;
const SKIPLIST_NODE_SIZE = 48;

class MemoryTracker {
  constructor(maxMemory) {
    this.maxMemory = maxMemory;
    this.memoryUsed = 0;
  }

  calcHashValueNodeSize(key, value, type) {
    // 3 references
    // "string", "list" literal for type
    // value
    const refBytes = REFERENCE_SIZE_BYTES * 3;
    const typeBytes = STRING_ONE_CHAR_BYTES * type.length;
    let valBytes = 0;
    if (type === "string") {
      valBytes = STRING_ONE_CHAR_BYTES * value.length;
    }

    return refBytes + typeBytes + valBytes;
  }

  stringCreate(key, value) {
    // main hash key, pointer to hash value node
    // hash value node
    const type = "string";
    const memory = this.calculateMainHashKeySize(key) + this.calcHashValueNodeSize(key, value, type);
    this.memoryUsed += memory;
  }

  stringUpdate(oldVal, newVal) {
    this.memoryUsed -= oldVal.length * STRING_ONE_CHAR_BYTES;
    this.memoryUsed += newVal.length * STRING_ONE_CHAR_BYTES;
  }

  listCreate(key, list) {
    this.memoryUsed += this.calculateStoreItemSize(key, list, "list");
  }

  listItemInsert(val) {
    this.memoryUsed += this.calculateListNodeSize(val);
  }

  listItemDelete(val) {
    this.memoryUsed -= this.calculateListNodeSize(val);
  }

  listItemUpdate(oldVal, newVal) {
    this.stringUpdate(oldVal, newVal);
  }

  deleteStoreItem(key, val, type) {
    this.memoryUsed -= this.calculateStoreItemSize(key, val, type);
  }

  createLRUList() {
    this.memoryUsed += this.calculateLRUListSize();
  }

  addLRUItem(key) {
    this.memoryUsed += this.calculateLRUNodeSize(key);
  }

  deleteLRUItem(key) {
    this.memoryUsed -= this.calculateLRUNodeSize(key);
  }

  calculateLRUListSize() {
    const refBytes = REFERENCE_SIZE_BYTES * 3;
    const lengthBytes = NUMBER_BYTES * 1;
    return refBytes + lengthBytes;
  }

  calculateLRUNodeSize(key) {
    const refBytes = REFERENCE_SIZE_BYTES * 3;
    const keyBytes = STRING_ONE_CHAR_BYTES * key.length;
    return refBytes + keyBytes;
  }

  calculateMainHashKeySize(key) {
    const keyBytes = STRING_ONE_CHAR_BYTES * key.length;
    return keyBytes + REFERENCE_SIZE_BYTES;
  }

  calculateListNodeSize(val) {
    const total_refs = REFERENCE_SIZE_BYTES * 3;
    const valueBytes = STRING_ONE_CHAR_BYTES * val.length;
    return total_refs + valueBytes;
  }

  calculateListSize(list) {
    let total = 0;
    total += REFERENCE_SIZE_BYTES * 3;
    total += NUMBER_BYTES * 1;
    let currentNode = list.head;
    while(currentNode) {
      total = total + this.calculateListNodeSize(currentNode.val);
      currentNode = currentNode.nextNode;
    }
    return total;
  }

  calculateStoreItemSize(key, val, type) {
    let returnVal;
    switch(type) {
      case "list":
        returnVal = this.calculateMainHashKeySize(key) + this.calcHashValueNodeSize(key, val, type) + this.calculateListSize(val);
        break;
      case "string":
        returnVal = this.calculateMainHashKeySize(key) + this.calcHashValueNodeSize(key, val, type);
        break;
    }
    return returnVal;
  }

  maxMemoryExceeded() {
    return this.memoryUsed > this.maxMemory;
  }
}

export default MemoryTracker;
