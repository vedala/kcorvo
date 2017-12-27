import CorvoLruEviction from './corvo_lru_eviction';

class CorvoEvictionPolicy {
  constructor(policy, memoryTracker) {
    this.policyImplementation = null;
    if (policy === "lru") {
        this.policyImplementation = new CorvoLruEviction(memoryTracker);
    }
  }

  checkAndEvictToMaxMemory(mainHash) {
    if (this.policyImplementation) {
      this.policyImplementation.checkAndEvictToMaxMemory(mainHash);
    }
  }

  remove(node, val, type) {
    if (this.policyImplementation) {
      this.policyImplementation.remove(node, val, type);
    }
  }

  add(key) {
    if (this.policyImplementation) {
      return this.policyImplementation.add(key);
    }
  }

  touch(nodePtr) {
    if (this.policyImplementation) {
      this.policyImplementation.touch(nodePtr);
    }
  }
}

export default CorvoEvictionPolicy;
