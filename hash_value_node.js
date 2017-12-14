class HashValueNode {
  constructor(type, val) {
    this.type = type;
    this.val = val;
    this.evictionPtr = null;
  }
}

export default HashValueNode;
