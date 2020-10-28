import { createContext, useState, useContext } from "react";

import NodePicker from "../../components/NodePicker";
import useApplication from "../useApplication";

import { INode } from "../../../types";

interface INodePickerContext {
  showNextNodePicker: (fromId: string) => void;
  isPickingNextNode: boolean;
}

export const NodePickerContext = createContext<INodePickerContext>({
  showNextNodePicker: () => {},
  isPickingNextNode: false
});

interface INodePickerProviderProps {
  children: any;
}

export function NodePickerProvider({ children }: INodePickerProviderProps) {
  const { selectedSequence, connectNodes } = useApplication();

  const [isPickingNextNode, setIsPickingNextNode] = useState(false);
  const [pickingTargetId, setPickingTargetId] = useState<string>(null);

  /**
   * Show the node picker and remember the target that we are coming from
   * @param fromId
   */
  async function showNextNodePicker(fromId: string) {
    setIsPickingNextNode(true);
    setPickingTargetId(fromId);
  }

  /**
   * Close the node picker and attach that node to the target
   * @param node
   * @param fromId
   */
  async function pickNextNode(node: INode, fromId?: string) {
    fromId = pickingTargetId ?? fromId;
    if (node && fromId) {
      connectNodes(fromId, node.id);
    }

    setIsPickingNextNode(false);
    setPickingTargetId(null);
  }

  return (
    <NodePickerContext.Provider
      value={{
        showNextNodePicker,
        isPickingNextNode
      }}>
      {children}
      <NodePicker isOpen={isPickingNextNode} nodes={selectedSequence?.nodes ?? []} onPickNextNode={pickNextNode} />
    </NodePickerContext.Provider>
  );
}

export default function useNodePicker() {
  return useContext(NodePickerContext);
}
