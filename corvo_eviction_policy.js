import CorvoLruEviction from './corvo_lru_eviction';

class CorvoEvictionPolicy {
  constructor(policy) {
    this.policyImplementation = null;
    if (policy === "lru") {
        this.policyImplementation = new CorvoLruEviction();
    }
  }

  checkAndEvictToMaxMemory() {
    this.policyImplementation.checkAndEvictToMaxMemory();
  }
}

export default CorvoEvictionPolicy;
