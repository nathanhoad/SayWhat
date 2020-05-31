import Node from "../Node";
import Connection from "../Connection";
import { findLinksToNode } from "../../lib/util";

import { INode } from "../../../types";

interface INodeListProps {
  nodes: INode[];
  selectedNode?: INode;
  onSelectNode: (node: INode) => void;
}

export default function NodeList({ nodes, selectedNode, onSelectNode }: INodeListProps) {
  if (!nodes) return null;

  const incomingLinks = findLinksToNode(selectedNode, nodes);

  return (
    <>
      {nodes.length === 0 && (
        <div className="NoNodes" data-testid="no-nodes">
          This sequence doesn't have any nodes yet.
        </div>
      )}
      {nodes.map(node => (
        <Node key={node.id} node={node} onClick={() => onSelectNode(node)} data-testid={`node-${node.id}`} />
      ))}
      {selectedNode?.options.map((option, index) => {
        return (
          <Connection
            key={index}
            index={index}
            fromId={option.id}
            toId={option.nextNodeId}
            data-testid="outgoing-connection"
          />
        );
      })}
      {incomingLinks.map((id, index) => (
        <Connection
          direction="in"
          key={index}
          index={index}
          fromId={id}
          toId={selectedNode.id}
          data-testid="incoming-connection"
        />
      ))}

      <style jsx>{`
        .NoNodes {
          text-align: center;
          font-size: 0.7rem;
          color: var(--color-line-dark);
          padding: 3rem;
        }
      `}</style>
    </>
  );
}
