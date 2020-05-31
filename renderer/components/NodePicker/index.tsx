import Drawer from "../Drawer";
import { Panel, Header, Section } from "../Layout";
import Lines from "../Node/Lines";

import { INode } from "../../../types";

interface Props {
  isOpen: boolean;
  nodes: INode[];
  onPickNextNode: (node: INode) => void;
}

export default function NodePicker({ isOpen, nodes, onPickNextNode }: Props) {
  return (
    <>
      <Drawer isOpen={isOpen} onClose={() => onPickNextNode(null)}>
        <Panel>
          <Header>
            <button onClick={() => onPickNextNode(null)} data-testid="cancel-button">
              Cancel
            </button>
          </Header>

          <Section>
            {nodes.map(node => (
              <div role="button" key={node.id} className="Node" onClick={() => onPickNextNode(node)} data-testid="node">
                <header>{node.name}</header>
                <div className="Preview">
                  <Lines lines={node.lines.slice(0, 3)} />
                </div>
              </div>
            ))}
          </Section>
        </Panel>
      </Drawer>

      <style jsx>{`
        .Node {
          padding: 0.5rem;
          font-size: 0.7rem;
          font-family: var(--font-family-sans-serif);
          cursor: pointer;
        }
        .Node:hover {
          background: var(--color-list-hover-background);
        }

        header {
          color: var(--color-node-name);
          font-size: 1.1rem;
          font-weight: bold;
          margin-bottom: 0.3rem;
          display: inline-block;
        }

        .Preview {
          opacity: 0.5;
          height: 3rem;
          overflow: hidden;
          position: relative;
        }
      `}</style>
    </>
  );
}
