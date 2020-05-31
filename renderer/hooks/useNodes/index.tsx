import { createContext, useContext, useMemo } from "react";

import useApplication from "../useApplication";
import { keyBy, getNodesByOptionId } from "../../lib/util";

import { INode } from "../../../types";

type NodeDictionary = { [id: string]: INode };

interface INodesContext {
  nodes: INode[];
  byId: NodeDictionary;
  byOptionId: NodeDictionary;
}

const NodesContext = createContext<INodesContext>(null);

export function NodesProvider({ children }: { children: any }) {
  const { selectedSequence } = useApplication();

  const nodes = selectedSequence?.nodes ?? [];
  const byId = useMemo(() => keyBy("id", selectedSequence?.nodes), [selectedSequence]);
  const byOptionId = useMemo(() => getNodesByOptionId(selectedSequence?.nodes), [selectedSequence]);

  return <NodesContext.Provider value={{ nodes, byId, byOptionId }}>{children}</NodesContext.Provider>;
}

export default function useNodes() {
  return useContext(NodesContext);
}
