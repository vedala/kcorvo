class CorvoLruNode {
  constructor(key) {
    this._prevNode = null;
    this._nextNode = null;
    this.key = key;
  }

  get prevNode() {
    return this._prevNode;
  }

  get nextNode() {
    return this._nextNode;
  }

  set prevNode(node) {
    this._prevNode = node;
  }

  set nextNode(node) {
    this._nextNode = node;
  }
}

export default CorvoLruNode;
