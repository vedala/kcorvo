import CorvoLruNode from './corvo_lru_node.js';

class CorvoLruLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  add(key) {
    const lruNode = new CorvoLruNode(key);
    if (this.tail === null) {
      this.head = lruNode;
    } else {
      this.tail.nextNode = lruNode;
      lruNode.prevNode = this.tail;
    }

    this.tail = lruNode;
    this.length += 1;

    return lruNode;
  }

  removeHead() {
    if (this.head) {
      const nextNode = this.head.nextNode;
      this.head = nextNode;
      if (nextNode) {
        nextNode.prevNode = null;
      }
    }
  }

  remove(inputNode) {
    if (this.head === this.tail) {
      this.head = null;
      this.tail = null;
    } else if (inputNode === this.head) {
      this.head = inputNode.nextNode;
      this.head.prevNode = null;
    } else if (inputNode === this.tail) {
      const tempPrevNode = this.tail.prevNode;
      tempPrevNode.nextNode = null;
      this.tail = tempPrevNode;
    } else {
      const tempPrevNode = inputNode.prevNode;
      const tempNextNode = inputNode.nextNode;
      tempPrevNode.nextNode = tempNextNode;
      tempNextNode.prevNode = tempPrevNode;
    }
    this.length -= 1;
  }

  touch(nodePtr) {
    this.remove(nodePtr);
    this.appendNode(nodePtr);
  }

  appendNode(nodePtr) {
    if (this.tail === null) {
      this.head = nodePtr;
    } else {
      this.tail.nextNode = nodePtr;
      nodePtr.prevNode = this.tail;
    }

    this.tail = nodePtr;
    this.length += 1;
  }
}

export default CorvoLruLinkedList;
