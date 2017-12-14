import CorvoLruEviction from './corvo_lru_eviction';

class CorvoEvictionPolicy {
  constructor(policy, memoryTracker) {
    this.policyImplementation = null;
    if (policy === "lru") {
        this.policyImplementation = new CorvoLruEviction(memoryTracker);
    }
  }

  checkAndEvictToMaxMemory() {
    this.policyImplementation.checkAndEvictToMaxMemory();
  }

  remove() {
  }

  append() {
  }

  touch() {
  }
}

export default CorvoEvictionPolicy;
