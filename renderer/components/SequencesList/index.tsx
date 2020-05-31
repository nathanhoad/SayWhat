import cn from "classnames";

import { Panel, Header, Section } from "../Layout";
import useApplication from "../../hooks/useApplication";
import { plural } from "../../lib/util";

export default function SequencesList() {
  const { project, selectedSequence, closeSequencesList, selectSequence, addSequence } = useApplication();

  if (!project) return <div />;

  function onAddSequence() {
    addSequence();
    closeSequencesList();
  }

  function onSelectSequence(sequence) {
    selectSequence(sequence);
    closeSequencesList();
  }

  return (
    <>
      <Panel>
        <Header>
          <button data-icon="add" onClick={() => onAddSequence()} data-testid="add-button">
            Add sequence
          </button>
        </Header>

        <Section>
          {project.sequences.map(sequence => (
            <div
              className={cn("Sequence", { Selected: selectedSequence?.id === sequence.id })}
              key={sequence.id}
              onClick={() => onSelectSequence(sequence)}
              data-testid={`sequence-${sequence.id}`}>
              <strong>{sequence.name}</strong>
              {plural(sequence.nodes.length, "node")}
            </div>
          ))}
        </Section>
      </Panel>

      <style jsx>{`
        .Sequence {
          padding: 0.5rem;
          color: #666;
          font-size: 0.8rem;
          line-height: 1.2rem;
          cursor: pointer;
        }
        .Sequence:not(.Selected):hover {
          background: var(--color-list-hover-background);
        }

        .Selected {
          background-color: var(--color-list-selected-background);
          color: var(--color-list-selected-foreground);
        }
        .Selected strong {
          color: var(--color-list-selected-foreground);
        }

        strong {
          display: block;
          color: #111;
        }
      `}</style>
    </>
  );
}
