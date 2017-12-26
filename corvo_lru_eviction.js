import CorvoLruLinkedList from './corvo_lru_linked_list';

class CorvoLruEviction {
  constructor(memoryTracker) {
    this.memoryTracker = memoryTracker;
    this.mainList = new CorvoLruLinkedList();
  }

  lruEvict(mainHash) {
    const key = this.mainList.head.key;
    this.memoryTracker.deleteStoreItem(key, mainHash[key].val, mainHash[key].type);
    this.mainList.removeHead();
    delete mainHash[key];
  }

  checkAndEvictToMaxMemory(mainHash) {
    while (this.memoryTracker.maxMemoryExceeded()) {
      this.lruEvict(mainHash);
    }
  }

  add(key) {
    return this.mainList.add(key);
  }

  remove(node, val, type) {
    const key = node.key;
    this.memoryTracker.deleteStoreItem(key, val, type);
    this.mainList.remove(node);
  }

  touch(nodePtr) {
    this.mainList.touch(nodePtr);
  }
}

export default CorvoLruEviction;
