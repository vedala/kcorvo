import CorvoLruLinkedList from './corvo_lru_linked_list';

class CorvoLruEviction {
  constructor(memoryTracker) {
    this.memoryTracker = memoryTracker;
    this.mainList = new CorvoLruLinkedList();
  }

  lruEvict() {
    this.del(this.mainList.head.key);
  }

  checkAndEvictToMaxMemory() {
    while (this.memoryTracker.maxMemoryExceeded()) {
      this.lruEvict();
    }
  }

  remove(key) {
  }

  add(key) {
    this.mainList.add(key);
  }
}

export default CorvoLruEviction;
