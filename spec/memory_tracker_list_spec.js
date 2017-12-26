import Store from "../store.js";
import CorvoLinkedList from "../corvo_linked_list.js";
import CorvoNode from "../corvo_node.js";
import CorvoListNode from '../data_types/corvo_list_node.js';
import MemoryTracker from "../memory_tracker";

describe("MemoryTracker", () => {
  it("uses listItemDelete to decrement memory used", () => {
    const testTracker = new MemoryTracker(100);
    testTracker.memoryUsed = 80;
    const val = 'my value';
    const testListNode = new CorvoListNode(val);

    testTracker.listItemDelete(testListNode);
    expect(testTracker.memoryUsed).toBe(40);
  });

  it("uses listItemInsert to update memory used", () => {
    const testTracker = new MemoryTracker(100);

    const val = 'my value';
    const testListNode = new CorvoListNode(val);

    testTracker.listItemInsert(testListNode.val);
    expect(testTracker.memoryUsed).toBe(40);
  });
});
