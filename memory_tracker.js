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

  nodeCreation(node) {
    const key = node.key;
    const val = node.val;
    const type = node.type;
    const memory = this.calculateStoreItemSize(key, val, type);

    this.memoryUsed += memory;
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

  listItemDelete(listNode) {
    this.memoryUsed -= this.calculateListNodeSize(listNode.val);
  }

  listItemUpdate(oldVal, newVal) {
    this.stringUpdate(oldVal, newVal);
  }

  listDelete(key, val) {
    this.memoryUsed -= this.calculateStoreItemSize(key, val, "list");
  }

  hashItemInsert(field, val) {
    this.memoryUsed += field.length * STRING_ONE_CHAR_BYTES + val.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
  }

  hashItemUpdate(oldVal, newVal) {
    this.stringUpdate(oldVal, newVal);
  }

  hashItemDelete(field, val) {
    this.memoryUsed -= field.length * STRING_ONE_CHAR_BYTES + val.length * STRING_ONE_CHAR_BYTES + REFERENCE_SIZE_BYTES;
  }

  hashDelete(key, val) {
    this.memoryUsed -= this.calculateStoreItemSize(key, val, "hash");
  }

  sortedSetElementInsert(oldVal, newVal) {
    this.memoryUsed += (newVal - oldVal);
  }

  setAddMember(member) {
    this.memoryUsed += 2 * REFERENCE_SIZE_BYTES;
    this.memoryUsed += 2 * (STRING_ONE_CHAR_BYTES * member.length);
  }

  setRemoveMember(member) {
    this.memoryUsed -= 2 * REFERENCE_SIZE_BYTES;
    this.memoryUsed -= 2 * (STRING_ONE_CHAR_BYTES * member.length);
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

  calculateNodeSize(key, val, type) {
    const total_refs = REFERENCE_SIZE_BYTES * 5;

    const valueBytes = type === "string" ? STRING_ONE_CHAR_BYTES * val.length : 0;

    const keyBytes = STRING_ONE_CHAR_BYTES * key.length;
    const typeStringBytes = STRING_ONE_CHAR_BYTES * type.length;
    return total_refs + valueBytes + keyBytes + typeStringBytes;
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
      case "hash":
        returnVal = this.calculateMainHashKeySize(key) + this.calculateNodeSize(key, val, type) + this.calculateHashSize(val);
        break;
      case "zset":
        returnVal = this.calculateMainHashKeySize(key) + this.calculateNodeSize(key, val, type) + this.calculateSortedSetSize(val);
        break;
      case "set":
        returnVal = this.calculateMainHashKeySize(key) + this.calculateNodeSize(key, val, type) + this.calculateSetSize(val);
        break;
    }
    return returnVal;
  }

  maxMemoryExceeded() {
    return this.memoryUsed > this.maxMemory;
  }
}

export default MemoryTracker;
