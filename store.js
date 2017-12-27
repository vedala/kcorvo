import CorvoTypeList from './data_types/corvo_type_list';
import CorvoTypeListNode from './data_types/corvo_type_list_node';
import MemoryTracker from './memory_tracker';
import StoreError from './store_error';
import CorvoEvictionPolicy from './corvo_eviction_policy';
import HashValueNode from './hash_value_node';

class Store {
  constructor(maxMemory, evictionPolicy) {
    this.mainHash = {};
    this.memoryTracker = new MemoryTracker(maxMemory);
    this.evictionPolicy = new CorvoEvictionPolicy(evictionPolicy, this.memoryTracker);
  }

  setString(key, value) {
    const accessedHashValueNode = this.mainHash[key];

    if (accessedHashValueNode === undefined) {
      this.mainHash[key] = new HashValueNode("string", value);
      const evictionPointer = this.evictionPolicy.add(key);
      this.mainHash[key].evictionPtr = evictionPointer;
      this.memoryTracker.stringCreate(key, value);
    } else {
      if (accessedHashValueNode.type === "string") {
        const oldValue = accessedHashValueNode.val;
        accessedHashValueNode.val = value;
        this.memoryTracker.stringUpdate(oldValue, value);
        this.touch(key);
      } else {
        this.del(key);
        this.mainHash[key] = new HashValueNode("string", value)
        const evictionPointer = this.evictionPolicy.add(key);
        this.mainHash[key].evictionPtr = evictionPointer;
        this.memoryTracker.stringCreate(key, value);
      }
    }

    this.evictionPolicy.checkAndEvictToMaxMemory(this.mainHash);
    return "OK";
  }

  setStringX(key, value) {
    // only writes if already exists; otherwise, return null
    const accessedHashValueNode = this.mainHash[key];

    if (accessedHashValueNode === undefined) {
      return null;
    }

    if (accessedHashValueNode.type === "string") {
      const oldValue = accessedHashValueNode.val;
      accessedHashValueNode.val = value;
      this.memoryTracker.stringUpdate(oldValue, value);
      this.touch(key);
    } else {
      this.del(key);
      this.mainHash[key] = new HashValueNode("string", value)
      const evictionPointer = this.evictionPolicy.add(key);
      this.mainHash[key].evictionPtr = evictionPointer;
      this.memoryTracker.stringCreate(key, value);
    }

    this.evictionPolicy.checkAndEvictToMaxMemory(this.mainHash);
    return "OK";
  }

  setStringNX(key, value) {
    // only writes if doesn't exist; otherwise return null
    const accessedHashValueNode = this.mainHash[key];

    if (accessedHashValueNode !== undefined) {
      return null;
    }

    this.mainHash[key] = new HashValueNode("string", value)
    const evictionPointer = this.evictionPolicy.add(key);
    this.mainHash[key].evictionPtr = evictionPointer;
    this.memoryTracker.stringCreate(key, value);

    this.evictionPolicy.checkAndEvictToMaxMemory(this.mainHash);
    return "OK";
  }

  getString(key) {
    const accessedHashValueNode = this.mainHash[key];
    if (accessedHashValueNode === undefined) {
      return null;
    } else if (accessedHashValueNode.type !== "string") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a string.");
    }

    const strValue = accessedHashValueNode.val;
    this.touch(key);
    return strValue;
  }

  appendString(key, valueToAppend) {
    const accessedHashValueNode = this.mainHash[key];
    let lengthAppendedValue;

    if (accessedHashValueNode === undefined) {
      this.mainHash[key] = new HashValueNode("string", valueToAppend)
      const evictionPointer = this.evictionPolicy.add(key);
      this.mainHash[key].evictionPtr = evictionPointer;
      this.memoryTracker.stringCreate(key, valueToAppend);
      lengthAppendedValue = valueToAppend.length;
    } else if (accessedHashValueNode.type === 'string') {
      this.touch(key);
      const oldValue = accessedHashValueNode.val;
      accessedHashValueNode.val += valueToAppend;
      this.memoryTracker.stringUpdate(oldValue, accessedHashValueNode.val);
      lengthAppendedValue = accessedHashValueNode.val.length;
    } else {
      throw new StoreError("StoreError: value at key not string type.");
    }

    this.evictionPolicy.checkAndEvictToMaxMemory(this.mainHash);
    return lengthAppendedValue;
  }

  touch(...keys) {
    let validKeys = 0;
    keys.forEach((key) => {
      const accessedHashValueNode = this.mainHash[key];
      if (accessedHashValueNode !== undefined) {
        validKeys += 1;
        this.evictionPolicy.touch(accessedHashValueNode.evictionPtr);
      }
    });
    return validKeys;
  }

  getStrLen(key) {
    const accessedHashValueNode = this.mainHash[key];
    if (accessedHashValueNode !== undefined) {
      this.evictionPolicy.touch(accessedHashValueNode.evictionPtr);
      if (accessedHashValueNode.type === 'string') {
        return accessedHashValueNode.val.length;
      } else {
        throw new StoreError("StoreError: value at key is not string type.")
      }
    } else {
      return 0;
    }
  }

  strIncr(key) {
    function isNumberString(strInput) {
      return ((parseInt(strInput)).toString() === strInput);
    }

    let accessedHashValueNode = this.mainHash[key];

    if (accessedHashValueNode === undefined) {
      this.setString(key, '0');
      accessedHashValueNode = this.mainHash[key];
    } else if (!isNumberString(accessedHashValueNode.val)) {
      throw new StoreError("StoreError: value at key is not a number string.");
    }

    const oldValue = accessedHashValueNode.val;
    accessedHashValueNode.val = (parseInt(accessedHashValueNode.val, 10) + 1).toString();
    this.memoryTracker.stringUpdate(oldValue, accessedHashValueNode.val);
    this.evictionPolicy.touch(accessedHashValueNode.evictionPtr);
    this.evictionPolicy.checkAndEvictToMaxMemory(this.mainHash);

    return parseInt(accessedHashValueNode.val, 10);
  }

  strDecr(key) {
    function isNumberString(strInput) {
      return ((parseInt(strInput)).toString() === strInput);
    }

    let accessedHashValueNode = this.mainHash[key];

    if (accessedHashValueNode === undefined) {
      this.setString(key, '0');
      accessedHashValueNode = this.mainHash[key];
    } else if (!isNumberString(accessedHashValueNode.val)) {
      throw new StoreError("StoreError: value at key is not a number string.");
    }

    const oldValue = accessedHashValueNode.val;
    accessedHashValueNode.val = (parseInt(accessedHashValueNode.val, 10) - 1).toString();
    this.memoryTracker.stringUpdate(oldValue, accessedHashValueNode.val);
    this.evictionPolicy.touch(accessedHashValueNode.evictionPtr);
    this.evictionPolicy.checkAndEvictToMaxMemory(this.mainHash);

    return parseInt(accessedHashValueNode.val, 10);
  }

  exists(...keys) {
    let existingKeysCount = 0;
    keys.forEach((key) => {
      if(this.mainHash[key]) {
        existingKeysCount += 1;
      }
    });
    return existingKeysCount;
  }

  type(key) {
    if (!this.mainHash[key]) {
      return "none";
    }
    return this.mainHash[key].type;
  }

  rename(keyA, keyB) {
    if (!this.exists(keyA)) {
      throw new StoreError("StoreError: No such key.");
    }

    const keyADataType = this.mainHash[keyA].type;

    if (keyADataType === 'string') {
      const val = this.mainHash[keyA].val;
      if (this.mainHash[keyB]) {
        this.del(keyB);
      }
      this.setString(keyB, val);
    } else if (keyADataType === 'list') {
      if (this.mainHash[keyB]) {
        this.del(keyB);
      }
      const val = this.mainHash[keyA].val;
      const newMainListNode = new CorvoNode(keyB, val, "list");
      this.mainList.append(newMainListNode);
      this.mainList[keyB] = newMainListNode;
      this.memoryTracker.nodeCreation(newMainListNode);
    } else if (keyADataType === 'hash') {
      if (this.mainHash[keyB]) {
      }
      const val = this.mainHash[keyA].val;
      const newMainHashNode = new CorvoNode(keyB, val, "hash");
      this.mainList.append(newMainHashNode);
      this.mainList[keyB] = newMainHashNode;
      this.memoryTracker.nodeCreation(newMainHashNode);
    }

    this.del(keyA);
    return "OK";
  }

  renameNX(keyA, keyB) {
    const keyAExists = !!this.mainHash[keyA];
    const keyBExists = !!this.mainHash[keyB];

    if (keyAExists) {
      if (keyBExists) {
        return 0;
      } else {
        this.rename(keyA, keyB);
        return 1;
      }
    } else {
      throw new StoreError("StoreError: No such key");
    }
  }

  del(...keys) {
    let numDeleted = 0;

    keys.forEach((key) => {
      const node = this.mainHash[key];
      if (node !== undefined) {
        const val = node.val;
        const type = node.type;
        const evictionPtr = node.evictionPointer;
        this.memoryTracker.deleteStoreItem(node);
        delete this.mainHash[key];
        this.evictionPolicy.remove(evictionPtr, val, type);
        numDeleted += 1;
      }
    });

    return numDeleted;
  }

  lpush(key, ...vals) {
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey && nodeAtKey.type === "list") {
      this.touch(key);
      vals.forEach((val) => {
        const newListNode = new CorvoTypeListNode(val) 
        nodeAtKey.val.prepend(newListNode);
        this.memoryTracker.listItemInsert(newListNode.val);
      });
      return nodeAtKey.val.length;
    } else if (nodeAtKey && nodeAtKey.type !== "list") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    } else {
      const newList = new CorvoTypeList();
      const evictionPointer = this.evictionPolicy.add(key);
      this.mainHash[key] = new HashValueNode("list", newList);
      this.mainHash[key].evictionPointer = evictionPointer;

      vals.forEach((val) => {
        const newListNode = new CorvoTypeListNode(val) 
        newList.prepend(newListNode);
      });

      this.memoryTracker.listCreate(key, newList);
      return newList.length;
    }
  }

  rpush(key, ...vals) {
    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey && nodeAtKey.type === "list") {
      this.touch(key);
      vals.forEach((val) => {
        const newListNode = new CorvoTypeListNode(val);
        nodeAtKey.val.append(newListNode);
        this.memoryTracker.listItemInsert(newListNode.val);
      });
      return nodeAtKey.val.length;
    } else if (nodeAtKey && nodeAtKey.type !== "list") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    } else {
      const newList = new CorvoTypeList();
      const evictionPointer = this.evictionPolicy.add(key);
      this.mainHash[key] = new HashValueNode("list", newList);
      this.mainHash[key].evictionPointer = evictionPointer;

      vals.forEach((val) => {
        const newListNode = new CorvoTypeListNode(val);
        newList.append(newListNode);
      });

      this.memoryTracker.listCreate(key, newList);
      return newList.length;
    }
  }

  createMainNodeForListType(key) {
    const newList = new CorvoLinkedList();
    const newNode = new CorvoNode(key, newList, "list", null, null);
    return newNode;
  }

  lpop(key) {
    if (this.mainHash[key]) {
      this.touch(key);
      const list = this.mainHash[key].val;

      return list.length ? list.lpop().val : null;
    } else {
      return null;
    }
  }

  rpop(key) {
    if (this.mainHash[key]) {
      this.touch(key);
      const list = this.mainHash[key].val;

      return list.length ? list.rpop().val : null;
    } else {
      return null;
    }
  }

  lindex(key, idx) {
    if (!this.mainHash[key]) {
      return null;
    }

    if (this.mainHash[key].type !== "list") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    }

    const list = this.mainHash[key].val;
    this.touch(key);
    let currIdx;
    let currListNode;
    if (idx >= 0) {
      currIdx = 0;
      currListNode = list.head;

      while (currListNode) {
        if (idx === currIdx) {
          return currListNode.val;
        }

        currIdx += 1;
        currListNode = currListNode.nextNode;
      }
    } else {
      currIdx = -1;
      currListNode = list.tail;

      while (currListNode) {
        if (idx === currIdx) {
          return currListNode.val;
        }

        currIdx -= 1;
        currListNode = currListNode.prevNode;
      }
    }

    return null;
  }

  lrem(key, count, val) {
    if (!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    }

    const list = this.mainHash[key].val;
    this.touch(key);
    let countRemoved = 0;
    let currListNode;

    if (count > 0) {
      currListNode = list.head;
      while (currListNode) {
        if (currListNode.val === val) {
          const nextListNode = currListNode.nextNode;
          this.memoryTracker.listItemDelete(currListNode);
          list.remove(currListNode);
          countRemoved += 1;

          if (countRemoved === count) {
            return countRemoved;
          }

          currListNode = nextListNode;
          continue;
        }

        currListNode = currListNode.nextNode;
      }
    } else if (count < 0) {
      currListNode = list.tail;
      while (currListNode) {
        if (currListNode.val === val) {
          const prevListNode = currListNode.prevNode;
          this.memoryTracker.listItemDelete(currListNode);
          list.remove(currListNode);
          countRemoved += 1;

          if (countRemoved === Math.abs(count)) {
            return countRemoved;
          }

          currListNode = prevListNode;
          continue;
        }

        currListNode = currListNode.prevNode;
      }
    } else {
      // count is 0, remove all elements matching val
      currListNode = list.head;
      while (currListNode) {
        if (currListNode.val === val) {
          const nextListNode = currListNode.nextNode;
          this.memoryTracker.listItemDelete(currListNode);
          list.remove(currListNode);
          countRemoved += 1;
          currListNode = nextListNode;
          continue;
        }

        currListNode = currListNode.nextNode;
      }
    }

    return countRemoved;
  }

  llen(key) {
    if(!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    }

    this.touch(key);
    return this.mainHash[key].val.length;
  }

  linsertBefore(key, pivotVal, newVal) {
    if (!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    }
    this.touch(key);
    this.memoryTracker.listItemInsert(newVal);
    return this.mainHash[key].val.insertBefore(pivotVal, newVal);
  }

  linsertAfter(key, pivotVal, newVal) {
    if (!this.mainHash[key]) {
      return 0;
    }

    if (this.mainHash[key].type !== "list") {
      this.touch(key);
      throw new StoreError("StoreError: value at key not a list.");
    }
    this.touch(key);
    this.memoryTracker.listItemInsert(newVal);
    return this.mainHash[key].val.insertAfter(pivotVal, newVal);
  }

  lset(key, idx, value) {
    if (!this.mainHash[key]) {
      throw new StoreError("StoreError: no such key.");
    }

    const nodeAtKey = this.mainHash[key];
    if (nodeAtKey.type !== "list") {
      throw new StoreError("StoreError: value at key not a list.");
    } else {
      const listLength = nodeAtKey.val.length;
      const normalizedIdx = (idx >= 0) ? idx : (listLength + idx);
      if (normalizedIdx < 0 || normalizedIdx >= listLength) {
        throw new StoreError("StoreError: index out of range.");
      }

      const list = nodeAtKey.val;
      let oldValue;

      // accessing indices at head and tail are required to be O(1)
      if (normalizedIdx === 0) {
        oldValue = list.head.val;
        list.head.val = value;
      } else if (normalizedIdx === (listLength - 1)) {
        oldValue = list.tail.val;
        list.tail.val = value;
      } else {
        let currListNode = list.head;
        for (let i = 0; i < normalizedIdx; i += 1) {
          currListNode = currListNode.nextNode
        }

        oldValue = currListNode.val;
        currListNode.val = value;
      }

      this.touch(nodeAtKey);
      this.memoryTracker.listItemUpdate(oldValue, value);
    }

    this.evictionPolicy.checkAndEvictToMaxMemory();
    return "OK";
  }

}

export default Store;
