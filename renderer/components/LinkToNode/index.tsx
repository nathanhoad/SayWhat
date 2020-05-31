import cn from "classnames";
import { MouseEvent } from "react";

import useApplication from "../../hooks/useApplication";
import useNodes from "../../hooks/useNodes";
import useNodePicker from "../../hooks/useNodePicker";

import { INodeOption, INode } from "../../../types";

interface Props {
  fromOption: INodeOption;
}

export default function LinkToNode({ fromOption }: Props) {
  const { selectNode, addNode } = useApplication();
  const { byId } = useNodes();
  const { showNextNodePicker } = useNodePicker();

  const linkedNode = byId[fromOption.nextNodeId];

  function onLinkedNodeClick(event: MouseEvent, node: INode) {
    // Stop clicking a linked node from passing to a click on the node itself
    event.stopPropagation();
    selectNode(node);
  }

  const isEnd = fromOption.nextNodeName === "END";

  return (
    <>
      <div className={cn("LinkToNode", { End: isEnd, NotFound: !linkedNode })}>
        <span className="Arrow">➜</span>

        {isEnd && (
          <span className="Text" data-testid="end">
            end conversation
          </span>
        )}

        {!isEnd && !linkedNode && (
          <span className="Text" data-testid="not-found">
            {fromOption.nextNodeName} doesn't exist.
            <span role="button" onClick={() => addNode(fromOption)} data-testid="create-button">
              Create #{fromOption.nextNodeName}
            </span>
            or
            <span role="button" onClick={() => showNextNodePicker(fromOption)} data-testid="pick-button">
              pick a node...
            </span>
          </span>
        )}

        {!isEnd && linkedNode && (
          <span role="button" onClick={e => onLinkedNodeClick(e, linkedNode)} className="Text" data-testid="node-link">
            {linkedNode.name}
          </span>
        )}
      </div>

      <style jsx>{`
        .LinkToNode {
          display: inline-block;
          font-weight: bold;
        }

        span[role="button"] {
          text-decoration: underline;
          cursor: pointer;
          margin: 0 0.2rem;
        }

        .Text {
          color: var(--color-node-name);
        }

        .Arrow {
          display: inline-block;
          margin: 0 0.2rem;
          color: var(--color-node-name);
        }

        .NotFound .Text,
        .NotFound .Arrow {
          color: var(--color-line-dark);
        }
        .NotFound span[role="button"] {
          text-decoration: underline;
          color: var(--color-node-name);
          font-weight: bold;
          cursor: pointer;
          margin: 0 3px;
        }

        .End .Arrow,
        .End .Text {
          color: var(--color-line-dark);
        }
      `}</style>
    </>
  );
}
