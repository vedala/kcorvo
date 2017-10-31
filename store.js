import CorvoLinkedList from './corvo_linked_list';
import CorvoNode from './corvo_node';

class Store {
  constructor() {
    this.mainHash = {};
    this.mainList = new CorvoLinkedList();
  }

  setString(key, value) {
    const newNode = new CorvoNode(value);
    this.mainHash[key] = newNode;
    this.mainList.append(newNode);
  }

  getString(key) {
    const accessedNode = this.mainHash[key];
    if (accessedNode === undefined) {
      return null;
    }

    const returnValue = accessedNode.val;
    this.mainList.remove(accessedNode);
    this.mainList.append(accessedNode);
    return returnValue;
  }
}

export default Store;