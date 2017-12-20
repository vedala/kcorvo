import CorvoLruEviction from './corvo_lru_eviction';

class CorvoEvictionPolicy {
  constructor(policy, memoryTracker) {
    this.policyImplementation = null;
    if (policy === "lru") {
        this.policyImplementation = new CorvoLruEviction(memoryTracker);
    }
  }

  checkAndEvictToMaxMemory() {
    if (this.policyImplementation) {
      this.policyImplementation.checkAndEvictToMaxMemory();
    }
  }

  remove(key) {
    if (this.policyImplementation) {
      this.policyImplementation.remove(key);
    }
  }

  add(key) {
    if (this.policyImplementation) {
      this.policyImplementation.add(key);
    }
  }

  touch() {
  }
}

export default CorvoEvictionPolicy;
