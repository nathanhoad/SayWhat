import { createContext, useState, useContext } from "react";

import NodePicker from "../../components/NodePicker";
import useApplication from "../useApplication";

import { INode, INodeOption } from "../../../types";

interface INodePickerContext {
  showNextNodePicker: (option: INodeOption) => void;
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
  const [pickingTarget, setPickingTarget] = useState<INodeOption>(null);

  /**
   * Show the node picker
   * @param option
   */
  async function showNextNodePicker(option: INodeOption) {
    setIsPickingNextNode(true);
    setPickingTarget(option);
  }

  /**
   * Close the node picker and attach that node to the target
   * @param toNode
   * @param option
   */
  async function pickNextNode(toNode: INode, option?: INodeOption) {
    const fromOption = pickingTarget ?? option;
    if (toNode && fromOption) {
      connectNodes(fromOption, toNode);
    }

    setIsPickingNextNode(false);
    setPickingTarget(null);
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
