import CorvoLinkedList from './corvo_linked_list';

class CorvoLruEviction {
  constructor(memoryTracker) {
    this.memoryTracker = memoryTracker;
    this.mainList = new CorvoLinkedList();
  }

  lruEvict() {
    this.del(this.mainList.head.key);
  }

  checkAndEvictToMaxMemory() {
    while (this.memoryTracker.maxMemoryExceeded()) {
      this.lruEvict();
    }
  }
}

export default CorvoLruEviction;

/*
      const newNode = new CorvoNode(key, value);
*/
