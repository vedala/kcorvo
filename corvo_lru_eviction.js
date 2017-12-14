class CorvoLruEviction {
  constructor() {
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
